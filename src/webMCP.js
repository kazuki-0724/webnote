import { useNotesStore } from './store/notes'

const tools = [
    {
        name: "app_version_checker",
        description: "アプリのバージョンを取得するツールです。エージェントはこのツールを使って、ユーザーにアプリのバージョンを報告できます。",
        parameters: {},
        execute: async (args) => {
            try {
                return {
                    status: "success",
                    message: `アプリのバージョンは 0.0.2 です。`,
                };
            } catch (error) {
                // エラーをエージェントに伝達し、ユーザーに報告させる
                return {
                    status: "error",
                    message: error.message
                };
            }
        }
    },
    {
        name: "createNote",
        description: "新しいノートを作成するツールです。エージェントはこのツールを使って、新しいノートを作成させることができます。",
        parameters: {},
        execute: async (args) => {
            try {
                const store = useNotesStore()
                await store.createNote("f1786439476607")
                return {
                    status: "success",
                    message: `新しいノートが作成されました。`,
                };
            } catch (error) {
                // エラーをエージェントに伝達し、ユーザーに報告させる
                return {
                    status: "error",
                    message: error.message
                };
            }
        }
    },
    {
        name: "updateNoteTitle",
        description: "ノートのタイトルを更新するツールです。エージェントはこのツールを使って、ノートのタイトルを更新させることができます。",
        parameters: {
            id: {
                type: "string",
                description: "ノートのID"
            },
            title: {
                type: "string",
                description: "新しいタイトル"
            }
        },
        execute: async (args) => {
            try {
                if (!args.id || !args.title) {
                    return {
                        status: "error",
                        message: "ノートのIDまたは新しいタイトルが指定されていません。"
                    };
                }
                const store = useNotesStore()
                await store.updateNoteTitle(args.id, args.title)
                return {
                    status: "success",
                    message: `ノートのタイトルが更新されました。`,
                };
            } catch (error) {
                // エラーをエージェントに伝達し、ユーザーに報告させる
                return {
                    status: "error",
                    message: error.message
                };
            }
        }
    },
    {
        name: "updateNoteContent",
        description: "ノートの内容を更新するツールです。エージェントはこのツールを使って、ノートの内容を更新させることができます。",
        parameters: {
            id: {
                type: "string",
                description: "ノートのID"
            },
            content: {
                type: "string",
                description: "新しい内容"
            }
        },
        execute: async (args) => {
            try {
                if (!args.id || !args.content) {
                    return {
                        status: "error",
                        message: "ノートのIDまたは新しい内容が指定されていません。"
                    };
                }
                const store = useNotesStore()
                await store.updateNoteContent(args.id, args.content)
                return {
                    status: "success",
                    message: `ノートの内容が更新されました。`,
                };
            } catch (error) {
                // エラーをエージェントに伝達し、ユーザーに報告させる
                return {
                    status: "error",
                    message: error.message
                };
            }
        }
    },
    {
        name: "fetchAllNoteHeaders",
        description: "ノートのIDとタイトルを取得するツールです。エージェントはこのツールを使って、ノートのIDとタイトルを取得させることができます。",
        parameters: {},
        execute: async (args) => {
            try {
                const store = useNotesStore()
                const notesInfo = await store.notes.map(note => ({ id: note.id, title: note.title }))
                return {
                    status: "success",
                    message: notesInfo,
                };
            } catch (error) {
                // エラーをエージェントに伝達し、ユーザーに報告させる
                return {
                    status: "error",
                    message: error.message
                };
            }
        }
    }
]

export function registerWebMCPTools() {
    // WebMCPがブラウザでサポートされているかを判定
    if ('modelContext' in document) {
        tools.forEach(tool => {
            document.modelContext.registerTool(tool);
        });
    }
}
