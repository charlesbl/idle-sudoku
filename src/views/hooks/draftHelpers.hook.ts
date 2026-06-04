import useLocalStorageState from 'use-local-storage-state'
import { allDraftHelpers, type DraftHelper } from '../../model/draftHelpers/draftHelpers'

interface DraftHelperHook {
    draftHelpers: DraftHelper[]
    addDraftHelper: (id: string) => void
    setDraftHelpers: (helpers: DraftHelper[]) => void
}

export const useDraftHelpers = (): DraftHelperHook => {
    const [draftHelperIds, setDraftHelperIds] = useLocalStorageState<string[]>('draftHelperIds', { defaultValue: [] })

    const getDraftHelper = (id: string): DraftHelper | undefined => allDraftHelpers.find(helper => helper.id === id)
    const addDraftHelper = (id: string): void => {
        if (draftHelperIds.includes(id)) return
        setDraftHelperIds([...draftHelperIds, id])
    }
    const draftHelpers = draftHelperIds
        .map(id => getDraftHelper(id))
        .filter((helper): helper is DraftHelper => helper !== undefined)
    const setDraftHelpers = (helpers: DraftHelper[]): void => {
        setDraftHelperIds(helpers.map(helper => helper.id))
    }

    return {
        draftHelpers,
        addDraftHelper,
        setDraftHelpers
    }
}
