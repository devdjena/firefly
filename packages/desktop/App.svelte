<script lang="typescript">
    import { Popup,Route,TitleBar,ToastContainer } from 'shared/components';
    import { loggedIn,mobile } from 'shared/lib/app';
    import { appSettings } from 'shared/lib/appSettings';
    import { getVersionDetails,pollVersion,versionDetails } from 'shared/lib/appUpdater';
    import { Electron } from 'shared/lib/electron';
    import { addError } from 'shared/lib/errors';
    import { goto } from 'shared/lib/helpers';
    import { dir,isLocaleLoaded,setupI18n,_ } from 'shared/lib/i18n';
    import { pollMarketData } from 'shared/lib/market';
    import { showAppNotification } from 'shared/lib/notifications';
    import { openPopup,popupState } from 'shared/lib/popup';
    import { cleanupEmptyProfiles,cleanupInProgressProfiles } from 'shared/lib/profile';
    import { dashboardRoute,initRouter,routerNext,routerPrevious,walletRoute } from 'shared/lib/router';
    import type { Locale } from 'shared/lib/typings/i18n';
    import { AppRoute,Tabs } from 'shared/lib/typings/routes';
    import {
    Appearance,
    Backup,
    Balance,
    Congratulations,
    Create,
    Dashboard,
    Import,
    Ledger,
    Legal,
    Login,
    Migrate,
    Password,
    Profile,
    Protect,
    Secure,
    Settings,
    Setup,
    Splash,
    Welcome
    } from 'shared/routes';
    import { onDestroy,onMount } from 'svelte';
    import { get } from 'svelte/store';
    import { getLocalisedMenuItems } from './lib/helpers';

    $: $appSettings.darkMode ? document.body.classList.add('scheme-dark') : document.body.classList.remove('scheme-dark')
    $: {
        isLocaleLoaded.subscribe((loaded) => {
            if (loaded) {
                Electron.updateMenu('strings', getLocalisedMenuItems($_ as Locale))
            }
        })
    }
    $: Electron.updateMenu('loggedIn', $loggedIn)

    $: if (document.dir !== $dir) {
        document.dir = $dir
    }

    let splash = true
    let settings = false

    void setupI18n({ fallbackLocale: 'en', initialLocale: $appSettings.language })
    onMount(async () => {
        setTimeout(() => {
            splash = false
            initRouter()
        }, 3000)

        await pollMarketData()

        // @ts-ignore: This value is replaced by Webpack DefinePlugin
        /* eslint-disable no-undef */
        if (!devMode) {
            await getVersionDetails()
            pollVersion()
        }
        Electron.onEvent('menu-navigate-wallet', (route) => {
            if (get(dashboardRoute) !== Tabs.Wallet) {
                dashboardRoute.set(Tabs.Wallet)
            }
            walletRoute.set(route)
        })
        Electron.onEvent('menu-navigate-settings', () => {
            if ($loggedIn) {
                if (get(dashboardRoute) !== Tabs.Settings) {
                    dashboardRoute.set(Tabs.Settings)
                }
            } else {
                settings = true
            }
        })
        Electron.onEvent('menu-check-for-update', () => {
            openPopup({
                type: 'version',
                props: {
                    currentVersion: $versionDetails.currentVersion,
                },
            })
        })
        Electron.onEvent('menu-error-log', () => {
            openPopup({ type: 'errorLog' })
        })
        Electron.onEvent('menu-diagnostics', () => {
            openPopup({ type: 'diagnostics' })
        })
        Electron.hookErrorLogger((err) => {
            addError(err)
        })

        Electron.onEvent('deep-link-request', showDeepLinkNotification)

        await cleanupInProgressProfiles()
        await cleanupEmptyProfiles()
    })

    onDestroy(() => {
        Electron.removeListenersForEvent('deep-link-request')
        Electron.DeepLinkManager.clearDeepLinkRequest()
    })

    const showDeepLinkNotification = () => {
        if(!$loggedIn) {
            showAppNotification({ type: 'info', message: $_('notifications.deepLinkingRequest.recievedWhileLoggedOut') })
        }
    }
</script>

<style global type="text/scss">
    @tailwind base;
    @tailwind components;
    @tailwind utilities;
    @import '../shared/style/style.scss';
    html,
    body {
        @apply bg-white;
        @apply select-none;
        -webkit-user-drag: none;

        ::-webkit-scrollbar {
            @apply w-5;
            @apply h-5;
        }

        ::-webkit-scrollbar-track {
            @apply bg-transparent;
        }

        ::-webkit-scrollbar-corner {
            @apply bg-transparent;
        }

        ::-webkit-scrollbar-thumb {
            @apply bg-gray-300;
            @apply border-solid;
            @apply rounded-2xl;
            border-width: 7px;
            /* This needs to match the background it is displayed on
               and can be override in local components using the secondary 
               and tertiary styles */
            @apply border-white;
        }

        .scroll-secondary {
            &::-webkit-scrollbar-thumb {
                @apply border-white;
            }
        }

        .scroll-tertiary {
            &::-webkit-scrollbar-thumb {
                @apply border-gray-50;
            }
        }

        .scroll-quaternary {
            &::-webkit-scrollbar-thumb {
                @apply border-gray-100;
            }
        }

        &.scheme-dark {
            @apply bg-gray-900;
            :global(::-webkit-scrollbar-thumb) {
                @apply bg-gray-700;
                @apply border-gray-900;
            }

            .scroll-secondary {
                &::-webkit-scrollbar-thumb {
                    @apply border-gray-800;
                }
            }

            .scroll-tertiary {
                &::-webkit-scrollbar-thumb {
                    @apply border-gray-900;
                }
            }

            .scroll-quaternary {
                &::-webkit-scrollbar-thumb {
                    @apply border-gray-900;
                }
            }
        }

        .multiwrap-line2 {
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            display: -webkit-box;
        }
    }
    @layer utilities {
        .scrollable-y {
            @apply overflow-y-auto;
            @apply -mr-2;
            @apply pr-2;
        }
    }
    img {
        -webkit-user-drag: none;
    }
</style>

<TitleBar>
    <!-- empty div to avoid auto-purge removing dark classes -->
    <div class="scheme-dark" />
    {#if !$isLocaleLoaded || splash}
        <Splash />
    {:else}
        {#if $popupState.active}
            <Popup
                type={$popupState.type}
                props={$popupState.props}
                hideClose={$popupState.hideClose}
                fullScreen={$popupState.fullScreen}
                transition={$popupState.transition}
                locale={$_} />
        {/if}
        <Route route={AppRoute.Welcome}>
            <Welcome on:next={routerNext} on:previous={routerPrevious} mobile={$mobile} locale={$_} />
        </Route>
        <Route route={AppRoute.Legal}>
            <Legal on:next={routerNext} on:previous={routerPrevious} mobile={$mobile} locale={$_} />
        </Route>
        <Route route={AppRoute.Appearance}>
            <Appearance on:next={routerNext} on:previous={routerPrevious} mobile={$mobile} locale={$_} />
        </Route>
        <Route route={AppRoute.Profile}>
            <Profile on:next={routerNext} on:previous={routerPrevious} mobile={$mobile} locale={$_} />
        </Route>
        <Route route={AppRoute.Setup}>
            <Setup on:next={routerNext} on:previous={routerPrevious} mobile={$mobile} locale={$_} />
        </Route>
        <!-- TODO: fix ledger -->
        <Route route={AppRoute.Create}>
            <Create on:next={routerNext} on:previous={routerPrevious} mobile={$mobile} locale={$_} />
        </Route>
        <Route route={AppRoute.LedgerSetup}>
            <Ledger on:next={routerNext} on:previous={routerPrevious} mobile={$mobile} locale={$_} />
        </Route>
        <!--  -->
        <Route route={AppRoute.Secure}>
            <Secure on:next={routerNext} on:previous={routerPrevious} mobile={$mobile} locale={$_} />
        </Route>
        <Route route={AppRoute.Password}>
            <Password on:next={routerNext} on:previous={routerPrevious} mobile={$mobile} locale={$_} />
        </Route>
        <Route route={AppRoute.Protect} transition={false}>
            <Protect on:next={routerNext} on:previous={routerPrevious} mobile={$mobile} locale={$_} />
        </Route>
        <Route route={AppRoute.Backup} transition={false}>
            <Backup on:next={routerNext} on:previous={routerPrevious} mobile={$mobile} locale={$_} />
        </Route>
        <Route route={AppRoute.Import} transition={false}>
            <Import on:next={routerNext} on:previous={routerPrevious} mobile={$mobile} locale={$_} />
        </Route>
        <Route route={AppRoute.Balance}>
            <Balance on:next={routerNext} on:previous={routerPrevious} mobile={$mobile} locale={$_} />
        </Route>
        <Route route={AppRoute.Migrate}>
            <Migrate on:next={routerNext} on:previous={routerPrevious} mobile={$mobile} locale={$_} {goto} />
        </Route>
        <Route route={AppRoute.Congratulations}>
            <Congratulations on:next={routerNext} mobile={$mobile} locale={$_} {goto} />
        </Route>
        <Route route={AppRoute.Dashboard}>
            <Dashboard mobile={$mobile} locale={$_} {goto} />
        </Route>
        <Route route={AppRoute.Login}>
            <Login on:next={routerNext} on:previous={routerPrevious} mobile={$mobile} locale={$_} {goto} />
        </Route>
        {#if settings}
            <Settings locale={$_} handleClose={() => (settings = false)} />
        {/if}

        <ToastContainer />
    {/if}
</TitleBar>
