import useLocalStorageState from 'use-local-storage-state'
import { type DraftHelper, allDraftHelpers } from '../../model/draftHelpers/draftHelpers'

interface DraftHelperHook {
    draftHelpers: DraftHelper[]
    addDraftHelper: (id: string) => void
}

export const useDraftHelpers = (): DraftHelperHook => {
    const [draftHelperIds, setDraftHelperIds] = useLocalStorageState<string[]>('draftHelperIds', { defaultValue: [] })

    const getDraftHelper = (id: string): DraftHelper | undefined => allDraftHelpers.find(strategy => strategy.id === id)
    const addDraftHelper = (id: string): void => { setDraftHelperIds([...draftHelperIds, id]) }
    const draftHelpers = draftHelperIds.map(id => getDraftHelper(id)) as DraftHelper[]

    return {
        draftHelpers,
        addDraftHelper
    }
}
