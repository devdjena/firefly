<script lang="typescript">
    import { Button, Text } from 'shared/components'
    import { closePopup } from 'shared/lib/popup'
    import { Locale } from 'shared/lib/typings/i18n'

    export let locale: Locale

    export let node

    export let onSuccess = (...args: any[]): void => {}

    function removeCustomNode() {
        if (onSuccess) {
            onSuccess(node)
        }
        closePopup()
    }
</script>

<Text type="h4" classes="mb-5">{locale('popups.node.titleRemove')}</Text>
<div class="w-full h-full mb-5">
    <Text>{locale('popups.node.removeConfirmation')}</Text>
</div>
<div class="flex flex-row justify-between space-x-4 w-full px-8 ">
    <Button secondary classes="w-1/2" onClick={() => closePopup()}>{locale('actions.no')}</Button>
    <Button classes="w-1/2" onClick={() => removeCustomNode()}>{locale('actions.yes')}</Button>
</div>
