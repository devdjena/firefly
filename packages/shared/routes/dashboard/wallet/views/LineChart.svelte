<script lang="typescript">
    import { ChartData, DashboardChartType, WalletChartType } from 'shared/lib/typings/chart'
    import type { Locale } from 'shared/lib/typings/i18n'
    import { AccountsBalanceHistory, BalanceHistory, WalletAccount } from 'shared/lib/typings/wallet'
    import { AvailableExchangeRates, CurrencyTypes } from 'shared/lib/typings/currency'
    import { HistoryDataProps } from 'shared/lib/typings/market'
    import { Chart, Dropdown, Text } from 'shared/components'
    import {
        getChartDataFromBalanceHistory,
        getChartDataForTokenValue,
        selectedDashboardChart,
        selectedWalletChart,
    } from 'shared/lib/chart'
    import { formatCurrencyValue } from 'shared/lib/currency'
    import { TIMEFRAME_MAP } from 'shared/lib/market'
    import { activeProfile, updateProfile } from 'shared/lib/profile'
    import { wallet } from 'shared/lib/wallet'
    import { getContext, onMount } from 'svelte'
    import { derived, get, Readable } from 'svelte/store'

    export let locale: Locale

    const walletBalanceHistory = getContext<Readable<BalanceHistory>>('walletBalanceHistory')
    const accountsBalanceHistory = getContext<Readable<AccountsBalanceHistory>>('accountsBalanceHistory')
    const selectedAccount = getContext<Readable<WalletAccount>>('selectedAccount')

    let chartData: ChartData = { labels: [], data: [], tooltips: [] }
    const chartTypeDropdownItems: { value: string; label: string }[] = []
    const currencyDropdownItems: { value: string; label: string }[] = []
    const tokenDropdownItems = [
        { value: CurrencyTypes.IOTA.toLocaleLowerCase(), label: CurrencyTypes.IOTA.toLocaleUpperCase() },
    ]

    let xMaxTicks

    let datasets: ChartData[]
    let labels: string[]
    let color: string

    $: datasets = [{ data: chartData.data, tooltips: chartData.tooltips, steppedLine: chartData.steppedLine ?? false }]
    $: labels = chartData.labels
    $: color = $selectedAccount ? $selectedAccount.color : 'blue'

    const walletBalance = derived(wallet, ($wallet) => {
        const { balanceOverview } = $wallet
        return get(balanceOverview)?.balanceRaw
    })

    const hasTitleBar = document.body.classList.contains('platform-win32')

    /** Chart data */
    $: {
        if (
            locale ||
            $selectedDashboardChart ||
            $activeProfile?.settings.chartSelectors ||
            $walletBalanceHistory ||
            $selectedAccount
        ) {
            if ($activeProfile?.settings) {
                // Account value chart
                if ($selectedAccount) {
                    switch ($selectedWalletChart) {
                        case WalletChartType.HOLDINGS:
                            chartData = getChartDataFromBalanceHistory({
                                balanceHistory: $accountsBalanceHistory[$selectedAccount.index],
                                currentBalance: $selectedAccount.rawIotaBalance,
                                tokenType: CurrencyTypes.IOTA.toLocaleLowerCase(),
                                convertToSelectedCurrency: false,
                            })
                            break
                        case WalletChartType.PORTFOLIO:
                            chartData = getChartDataFromBalanceHistory({
                                balanceHistory: $accountsBalanceHistory[$selectedAccount.index],
                                currentBalance: $selectedAccount.rawIotaBalance,
                                tokenType: CurrencyTypes.IOTA.toLocaleLowerCase(),
                                convertToSelectedCurrency: true,
                            })
                            break
                        default:
                            break
                    }
                    switch ($activeProfile?.settings.chartSelectors.timeframe) {
                        case HistoryDataProps.ONE_HOUR:
                        case HistoryDataProps.TWENTY_FOUR_HOURS:
                            xMaxTicks = 4
                            break
                        case HistoryDataProps.SEVEN_DAYS:
                        case HistoryDataProps.ONE_MONTH:
                            xMaxTicks = 6
                            break
                    }
                } else {
                    switch ($selectedDashboardChart) {
                        case DashboardChartType.HOLDINGS:
                            chartData = getChartDataFromBalanceHistory({
                                balanceHistory: $walletBalanceHistory,
                                currentBalance: get(walletBalance),
                                tokenType: CurrencyTypes.IOTA.toLocaleLowerCase(),
                            })
                            break
                        case DashboardChartType.PORTFOLIO:
                            chartData = getChartDataFromBalanceHistory({
                                balanceHistory: $walletBalanceHistory,
                                currentBalance: get(walletBalance),
                                tokenType: CurrencyTypes.IOTA.toLocaleLowerCase(),
                                convertToSelectedCurrency: true,
                            })
                            break
                        case DashboardChartType.TOKEN:
                            chartData = getChartDataForTokenValue()
                            break
                        default:
                            break
                    }
                    xMaxTicks = undefined
                }
            }
        }
    }

    onMount(() => {
        const profileCurrency: AvailableExchangeRates = $activeProfile?.settings.currency ?? AvailableExchangeRates.USD
        Object.values(CurrencyTypes).forEach((currency) => {
            if (currency !== CurrencyTypes.IOTA) {
                currencyDropdownItems.push({
                    value: currency.toUpperCase(),
                    label: currency.toUpperCase(),
                })
            }
        })

        if (!CurrencyTypes[profileCurrency]) {
            currencyDropdownItems.push({ value: profileCurrency, label: profileCurrency })
        }
        // change to USD if previously selected currency is not in the list anymore
        if (!currencyDropdownItems.some(({ value }) => value === $activeProfile?.settings.chartSelectors.currency)) {
            updateProfile('settings.chartSelectors.currency', AvailableExchangeRates.USD)
        }

        Object.values(WalletChartType).forEach((chartType) => {
            chartTypeDropdownItems.push({
                value: chartType,
                label: locale(`charts.${chartType}`),
            })
        })
    })

    function handleDashboardChartTypeSelect(chart) {
        selectedDashboardChart.set(chart)
    }

    function handleWalletChartTypeSelect({ value: chart }) {
        selectedWalletChart.set(chart)
    }

    function handleCurrencySelect({ value: currency }) {
        updateProfile('settings.chartSelectors.currency', currency)
    }

    function formatYAxis(value) {
        return formatCurrencyValue(
            value,
            (!$selectedAccount && $selectedDashboardChart === DashboardChartType.HOLDINGS) ||
                ($selectedAccount && $selectedWalletChart === WalletChartType.HOLDINGS)
                ? CurrencyTypes.IOTA
                : $activeProfile?.settings.chartSelectors.currency
                ? $activeProfile?.settings.chartSelectors.currency
                : '',
            undefined,
            undefined,
            5
        )
    }
</script>

<style type="text/scss">
    button.active {
        @apply relative;
        &:after {
            content: '';
            @apply bg-blue-500;
            @apply w-full;
            @apply rounded;
            @apply h-0.5;
            @apply absolute;
            @apply -bottom-2.5;
            @apply left-0;
        }
    }
</style>

<div data-label="line-chart" class="flex flex-col justify-between w-full h-full px-8 py-4">
    <div class="flex justify-between items-center mb-2">
        {#if !$selectedAccount}
            <div class="flex space-x-4">
                {#each Object.values(DashboardChartType) as chart}
                    <button
                        on:click={() => handleDashboardChartTypeSelect(chart)}
                        class:active={chart === $selectedDashboardChart}>
                        <Text type="h5" secondary={chart !== $selectedDashboardChart}>{locale(`charts.${chart}`)}</Text>
                    </button>
                {/each}
            </div>
        {:else}
            <div class="flex space-x-4 -ml-3">
                <Dropdown
                    small
                    value={locale(`charts.${$selectedWalletChart}`)}
                    items={chartTypeDropdownItems}
                    onSelect={handleWalletChartTypeSelect}
                    contentWidth={true}
                    valueTextType="h5"
                    showBorderWhenClosed={false} />
            </div>
        {/if}
        <div class="flex justify-between items-center space-x-2">
            {#if (!$selectedAccount && $selectedDashboardChart === DashboardChartType.HOLDINGS) || ($selectedAccount && $selectedWalletChart === WalletChartType.HOLDINGS)}
                <span>
                    <Dropdown
                        small
                        value={tokenDropdownItems[0].label}
                        items={tokenDropdownItems}
                        contentWidth={true} />
                </span>
            {:else}
                <span>
                    <Dropdown
                        small
                        value={$activeProfile?.settings.chartSelectors.currency}
                        items={currencyDropdownItems}
                        onSelect={handleCurrencySelect}
                        contentWidth={true} />
                </span>
            {/if}
            <span>
                <Dropdown
                    small
                    value={locale(`charts.timeframe${TIMEFRAME_MAP[$activeProfile?.settings.chartSelectors.timeframe]}`)}
                    items={Object.keys(TIMEFRAME_MAP).map((value) => ({
                        label: locale(`charts.timeframe${TIMEFRAME_MAP[value]}`),
                        value,
                    }))}
                    onSelect={(newTimeframe) => updateProfile('settings.chartSelectors.timeframe', newTimeframe.value)}
                    contentWidth={true} />
            </span>
        </div>
    </div>
    <Chart
        type="line"
        {datasets}
        beginAtZero={$selectedAccount || $selectedDashboardChart !== DashboardChartType.TOKEN}
        {labels}
        {color}
        {xMaxTicks}
        {formatYAxis}
        inlineStyle={$selectedAccount && `height: calc(50vh - ${hasTitleBar ? '190' : '150'}px);`} />
</div>
