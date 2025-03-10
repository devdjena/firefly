<script lang="typescript">
    import { activeProfile } from 'shared/lib/profile'
    import { Animation, Button, Icon, OnboardingLayout, Spinner, Text } from 'shared/components'
    import {
        formatAddressForLedger,
        ledgerSimulator,
        displayNotificationForLedgerProfile,
        promptUserToConnectLedger,
    } from 'shared/lib/ledger'
    import { getOfficialNetwork, getOfficialNodes } from 'shared/lib/network'
    import { api } from 'shared/lib/wallet'
    import { createEventDispatcher } from 'svelte'
    import { Locale } from 'shared/lib/typings/i18n'

    export let locale: Locale

    export let mobile

    let newAddress = null

    let busy = false
    let confirmed = false

    const dispatch = createEventDispatcher()

    $: animation = !newAddress
        ? 'ledger-generate-address-desktop'
        : confirmed
            ? 'ledger-address-confirmed-desktop'
            : 'ledger-confirm-address-desktop'

    function generateNewAddress() {
        newAddress = null
        busy = true

        const _createAccount = (idx) => {
            const officialNodes = getOfficialNodes()
            const officialNetwork = getOfficialNetwork()
            api.createAccount(
                {
                    clientOptions: {
                        nodes: officialNodes,
                        node: officialNodes[Math.floor(Math.random() * officialNodes.length)],
                        network: officialNetwork,
                    },
                    alias: `${locale('general.account')} ${idx}`,
                    signerType: { type: ledgerSimulator ? 'LedgerNanoSimulator' : 'LedgerNano' },
                    allowCreateMultipleEmptyAccounts: true,
                },
                {
                    onSuccess(createAccountResponse) {
                        newAddress = createAccountResponse.payload.addresses[0].address

                        displayAddress()
                    },
                    onError(error) {
                        busy = false

                        console.error(error)

                        displayNotificationForLedgerProfile('error', true, true, false, false, error)
                    },
                }
            )
        }

        const _onConnected = () => {
            api.getAccounts({
                onSuccess(getAccountsResponse) {
                    if (getAccountsResponse.payload.length > 0) {
                        if (getAccountsResponse.payload[$activeProfile.ledgerMigrationCount]) {
                            newAddress = getAccountsResponse.payload[$activeProfile.ledgerMigrationCount].addresses[0].address
                            displayAddress()
                        } else {
                            _createAccount($activeProfile.ledgerMigrationCount + 1)
                        }
                    } else {
                        _createAccount(1)
                    }
                },
                onError(getAccountsError) {
                    busy = false
                    console.error(getAccountsError)
                },
            })
        }

        const _onCancel = () => (busy = false)
        promptUserToConnectLedger(false, _onConnected, _onCancel)
    }

    function displayAddress() {
        api.getMigrationAddress(true, $activeProfile.ledgerMigrationCount, {
            onSuccess() {
                busy = false

                handleConfirmClick()
            },
            onError(err) {
                newAddress = null
                busy = false

                console.error(err)

                displayNotificationForLedgerProfile('error', true, true, false, false, err)
            },
        })
    }

    function handleConfirmClick() {
        confirmed = true
    }

    function handleContinueClick() {
        dispatch('next')
    }

    function handleBackClick() {
        dispatch('previous')
    }
</script>

{#if mobile}
    <div>foo</div>
{:else}
    <OnboardingLayout onBackClick={handleBackClick} {busy} {locale} showLedgerProgress showLedgerVideoButton>
        <div slot="leftpane__content">
            {#if !newAddress}
                <Text type="h2" classes="mb-5">{locale('views.generateNewLedgerAddress.title')}</Text>
                <Text type="p" secondary>{locale('views.generateNewLedgerAddress.body')}</Text>
            {:else if !confirmed}
                <Text type="h2" classes="mb-5">{locale('views.generateNewLedgerAddress.confirmTitle')}</Text>
                <Text type="p" secondary classes="mb-10">{locale('views.generateNewLedgerAddress.confirmBody')}</Text>
                <div class="rounded-lg bg-gray-50 dark:bg-gray-900 p-5 text-center">
                    <Text type="h5" highlighted classes="mb-2">{locale('general.newAddress')}</Text>
                    <Text type="pre" bigger>{formatAddressForLedger(newAddress)}</Text>
                </div>
            {:else}
                <Text type="h2" classes="mb-5">{locale('views.generateNewLedgerAddress.confirmedTitle')}</Text>
                <Text type="p" secondary classes="mb-12">{locale('views.generateNewLedgerAddress.confirmedBody')}</Text>
                <div class="flex flex-col items-center bg-gray-50 dark:bg-gray-900 rounded-lg p-5 text-center">
                    <div class="bg-green-100 rounded-2xl relative -mt-10 mb-4">
                        <Icon icon="success-check" classes="text-white" />
                    </div>
                    <Text type="h5" highlighted classes="mb-2">{locale('general.newAddress')}</Text>
                    <Text type="pre" bigger>{formatAddressForLedger(newAddress)}</Text>
                </div>
            {/if}
        </div>
        <div slot="leftpane__action" class="flex flex-col space-y-4">
            {#if newAddress}
                <Button classes="w-full" disabled={!confirmed} onClick={handleContinueClick}>{locale('actions.continue')}</Button>
            {:else}
                <Button classes="w-full" disabled={busy} onClick={generateNewAddress}>
                    {#if busy}
                        <Spinner
                            busy={true}
                            message={locale('views.generateNewLedgerAddress.generating')}
                            classes="justify-center" />
                    {:else}{locale('actions.generateAddress')}{/if}
                </Button>
            {/if}
        </div>
        <div slot="rightpane" class="w-full h-full flex justify-center items-center bg-gray-50 dark:bg-gray-900">
            <Animation
                width="100%"
                animation="ledger-bg-desktop"
                classes="absolute transform left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
            <Animation width="100%" {animation} />
        </div>
    </OnboardingLayout>
{/if}
