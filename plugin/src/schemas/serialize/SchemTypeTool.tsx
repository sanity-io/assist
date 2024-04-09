import {SyncIcon} from '@sanity/icons'
import {Box, Button, Card, Flex, Label, Spinner, Stack} from '@sanity/ui'
import {useCallback, useMemo, useState} from 'react'
import {useClient, useSchema} from 'sanity'

import {useListeningQuery} from '../../_lib/useListeningQuery'
import {assistSerializedTypeName, SerializedSchemaType} from '../../types'
import {serializeSchema} from './serializeSchema'

const NO_DATA: SerializedSchemaType[] = []

const defaultTitle = 'Sync schema'

export function SchemaTypeTool() {
  const schema = useSchema()
  const client = useClient({apiVersion: '2023-01-01'})
  const [saving, setSaving] = useState(false)
  const [syncTitle, setSyncTitle] = useState(defaultTitle)

  const {data} = useListeningQuery<SerializedSchemaType[]>('*[_type==$type] | order(_type)', {
    type: assistSerializedTypeName,
  })

  const types = useMemo(() => {
    return serializeSchema(schema)
  }, [schema])

  const storeTypes = useCallback(() => {
    setSaving(true)
    let canSave = true
    async function store() {
      setSyncTitle(`Syncing 0/${types.length}`)
      const transaction = client.transaction()
      for (let i = 0; i < types.length; i++) {
        if (!canSave) {
          break
        }
        const type = types[i]
        await transaction.createOrReplace(type as Required<typeof type>)
        if (i > 0 && i % 50 === 0) {
          await transaction.commit()
          transaction.reset()
          setSyncTitle(`Syncing ${i}/${types.length}`)
        }
      }
      await transaction.commit()
    }
    store()
      .catch(console.error)
      .finally(() => {
        setSaving(false)
        setSyncTitle(defaultTitle)
      })
    return () => {
      canSave = false
      setSaving(false)
      setSyncTitle(defaultTitle)
    }
  }, [types, client, setSaving, setSyncTitle])

  return (
    <Card padding={4} overflow="auto" style={{height: 'calc(100vh - 81px)'}}>
      <Stack space={4}>
        <Box>
          <Button
            icon={saving ? <Spinner style={{marginTop: 5}} /> : SyncIcon}
            text={syncTitle}
            disabled={saving}
            onClick={storeTypes}
          />
        </Box>
        <Flex gap={2}>
          <Stack space={2}>
            <Label>Studio schema</Label>
            <ul>
              {types.map((type) => (
                <li key={type.name}>
                  <SchemaEntry schemaStub={type} />
                </li>
              ))}
            </ul>
          </Stack>

          <Stack space={2}>
            <Label>Stored schema</Label>
            <ul>
              {(data ?? NO_DATA).map((type) => (
                <li key={type.name}>
                  <SchemaEntry schemaStub={type} />
                </li>
              ))}
            </ul>
          </Stack>
        </Flex>
      </Stack>
    </Card>
  )
}

function SchemaEntry({schemaStub}: {schemaStub: SerializedSchemaType}) {
  const out = useMemo(() => JSON.stringify(schemaStub, null, 2), [schemaStub])
  return <pre>{out}</pre>
}
