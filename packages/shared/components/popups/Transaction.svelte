<script lang="typescript">
    import { Unit } from '@iota/unit-converter'
    import { Button, Illustration, Text } from 'shared/components'
    import {
        convertToFiat,
        currencies,
        exchangeRates,
        formatCurrency,
        isFiatCurrency,
    } from 'shared/lib/currency'
    import { closePopup } from 'shared/lib/popup'
    import { activeProfile } from 'shared/lib/profile'
    import { formatUnitBestMatch, formatUnitPrecision } from 'shared/lib/units'
    import { Locale } from 'shared/lib/typings/i18n'
    import { AvailableExchangeRates, CurrencyTypes } from 'shared/lib/typings/currency'

    export let locale: Locale

    export let internal = false
    export let to = ''
    export let amount = 0
    export let unit = Unit.i
    export let onConfirm = (..._: any[]): void => {}

    const displayAmount = getFormattedAmount()

    function getFormattedAmount() {
        const isFiat = isFiatCurrency(unit)
        const currency = $activeProfile?.settings.currency ?? AvailableExchangeRates.USD

        const iotaAmount = isFiat ? formatUnitBestMatch(amount) : formatUnitPrecision(amount, unit)
        const fiatAmount = formatCurrency(convertToFiat(amount, $currencies[CurrencyTypes.USD], $exchangeRates[currency]), currency)

        return isFiat ? `${fiatAmount} (${iotaAmount})` : `${iotaAmount} (${fiatAmount})`
    }

    function handleCancelClick() {
        closePopup()
    }
</script>

<style type="text/scss">
    .illustration {
        height: 250px;
        :global(img) {
            min-height: 280px;
            max-width: 100%;
            object-position: 0 -3px;
        }
    }
</style>

<Text type="h4" classes="mb-6">{locale('popups.transaction.title')}</Text>
<div class="flex w-full flex-row flex-wrap">
    <div class="illustration w-full bg-pastel-yellow dark:bg-gray-900 flex justify-center">
        <Illustration illustration="balance-desktop" />
    </div>
    <div class="w-full text-center my-9 px-10">
        <Text type="h4" highlighted classes="mb-3">
            {locale('popups.transaction.body', { values: { amount: displayAmount } })}
        </Text>
        <Text type={internal ? 'p' : 'pre'} secondary bigger>{to}</Text>
    </div>
    <div class="flex flex-row flex-nowrap w-full space-x-4">
        <Button classes="w-full" secondary onClick={() => handleCancelClick()}>{locale('actions.cancel')}</Button>
        <Button classes="w-full" onClick={onConfirm}>{locale('actions.confirm')}</Button>
    </div>
</div>
