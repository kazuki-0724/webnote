import { useNotesStore } from './store/notes'

function normalizeStroke(rawStroke) {
  if (!rawStroke) {
    throw new Error('stroke が指定されていません。')
  }

  let parsed = rawStroke
  if (typeof rawStroke === 'string') {
    try {
      parsed = JSON.parse(rawStroke)
    } catch (error) {
      throw new Error('stroke は JSON 形式で指定してください。')
    }
  }

  if (Array.isArray(parsed)) {
    return parsed
  }

  if (parsed && typeof parsed === 'object') {
    if (Array.isArray(parsed.strokes)) {
      return parsed.strokes
    }

    if (Array.isArray(parsed.points)) {
      return [parsed]
    }
  }

  throw new Error('stroke は単一の stroke または strokes 配列で指定してください。')
}

const tools = [
    {
        name: "app_version",
        description: "アプリのバージョンを取得するツールです。エージェントはこのツールを使って、ユーザーにアプリのバージョンを報告できます。",
        parameters: {},
        execute: async (args) => {
            try {
                return {
                    status: "success",
                    message: `アプリのバージョンは 0.0.5 です。`,
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
    },
    {
        name: "drawPicture",
        description: "ノートに絵を描くツールです。AI はライオンなどの複雑な図を複数の stroke で構成して、ここにまとめて流し込めます。",
        parameters: {
            strokes: {
                type: "string",
                description: "描画用の stroke JSON。単一 stroke でも、strokes 配列でも指定可能。例: {\"tool\":\"pen\",\"color\":\"#111827\",\"width\":5,\"points\":[{\"x\":100,\"y\":150},{\"x\":120,\"y\":170}]} または {\"strokes\":[{...},{...}] }"
            },
            noteId: {
                type: "string",
                description: "描画先のノート ID。省略した場合は現在選択中のノートを使う。"
            }
        },
        execute: async (args) => {
            try {
                const normalizedStroke = normalizeStroke(args.strokes)
                const store = useNotesStore()
                const targetNoteId = args.noteId || store.selectedNoteId

                if (!targetNoteId) {
                    return {
                        status: "error",
                        message: "描画先のノートが選択されていません。noteId を指定するか、ホワイトボードを先に選択してください。"
                    };
                }

                store.drawPicture(targetNoteId, normalizedStroke)
                return {
                    status: "success",
                    message: `ノートに ${Array.isArray(normalizedStroke) ? normalizedStroke.length : 1} 本の stroke を描画しました。`,
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
