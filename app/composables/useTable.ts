interface MysqlStructure {
  Field: string
  Type: string
}

interface SqliteStructure {
  name: string
  type: string
}

export interface Structure {
  columnName: string
  dataType: string
}

type QueryStructureResults = MysqlStructure[] | SqliteStructure[]

function normalizeStructure(value: QueryStructureResults): Structure[] {
  return value.map((item: any) => ({
    columnName: item.Field ?? item.name,
    dataType: item.Type ?? item.type,
  }))
}

export function useCursorDriver(cursor: MaybeRef<Database | undefined>) {
  return computed(() => unref(cursor)?.path.split(':')[0] ?? 'mysql')
}

function parseConnectionURL(value: string) {
  if (value.startsWith('mysql')) {
    const matches = value.match(ConnectionPattern.MYSQL) ?? []
    const [_, username, password, host, port, database, queries] = matches
    return { username, password, host, port, database: database ?? '', queries }
  }

  if (value.startsWith('sqlite')) {
    const database = new URL(value).pathname.split('/').filter(Boolean)[0] ?? ''
    return { database }
  }

  return { database: '' }
}

export function useTable(tableName: MaybeRef<string>, cursorInstance: MaybeRef<Database>) {
  const table = computed(() => unref(tableName))
  const cursor = computed(() => unref(cursorInstance))
  const limit = ref(100)
  const offset = ref(0)
  const count = ref(0)
  const data = ref<any[]>([])
  const structure = ref<Structure[]>([])
  const isLoading = ref([false, false])
  const primaryKeys = ref<string[]>([])
  const driver = useCursorDriver(cursor)
  const where = ref('')
  const { sql } = useSelect([], table, { where, limit, offset })
  const isReady = computed(() => !!cursor.value)

  watchImmediate(() => [isReady.value, table.value], ([v]) => {
    if (v)
      Promise.allSettled([setup(), execute()])
  })

  async function setup() {
    try {
      if (table.value && cursor.value) {
        isLoading.value[0] = true
        const { database } = parseConnectionURL(cursor.value.path)
        const results = await Promise.all([
          cursor.value?.select<QueryStructureResults>(Sql.DESCRIBE_TABLE(table.value)[driver.value]!),
          cursor.value?.select<{ count: number }[]>(`SELECT COUNT(*) as count FROM \`${table.value}\`;`),
          queryPrimaryKeys(database, table.value, cursor.value),
        ])
        structure.value = normalizeStructure(results[0] ?? [])
        count.value = results[1]?.[0]?.count ?? 0
        primaryKeys.value = results[2]
      }
    }
    finally {
      isLoading.value[0] = false
    }
  }

  async function execute() {
    if (table.value && cursor.value) {
      try {
        isLoading.value[1] = true
        data.value = await cursor.value?.select<any[]>(sql.value) ?? []
      }
      catch {
        data.value = []
      }
      finally {
        isLoading.value[1] = false
      }
    }
  }

  return {
    data,
    structure,
    limit,
    offset,
    count,
    primaryKeys,
    where,
    isLoading: computed(() => isLoading.value.some(Boolean)),
    setup,
    execute,
  }
}

export function useTables(cursorInstance: MaybeRef<Database | undefined> | undefined) {
  const cursor = computed(() => unref(cursorInstance))
  const tables = ref<string[]>([])
  const isLoading = ref(false)
  const isReady = computed(() => !!cursor.value)
  const driver = useCursorDriver(cursor)

  async function execute() {
    try {
      isLoading.value = true
      const sql = Sql.SHOW_TABLES()[driver.value]!
      const data: Record<string, string>[] = await cursor.value?.select(sql) ?? []

      if (driver.value === 'mysql')
        tables.value = data.map(item => Object.values(item)[0] as string)
      if (driver.value === 'sqlite')
        tables.value = data.map(({ tbl_name }) => tbl_name as string)
    }
    finally {
      isLoading.value = false
    }
  }

  watchImmediate(isReady, (value) => {
    if (value)
      execute()
  })

  return {
    tables,
    isLoading,
    execute,
  }
}
