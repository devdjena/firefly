<script lang="typescript">
    import { icons } from './icons'

    export let icon = undefined
    export let width = undefined
    export let height = undefined
    export let classes = ''
    export let boxed = false
    export let boxClasses = 'undefined'

    $: selected = icons[icon]
</script>

<style type="text/scss">
    .boxed {
        border-radius: 0.625rem; // TODO: add to tailwind
    }
</style>

{#if selected}
    {#if boxed}
        <div class="boxed w-8 h-8 flex justify-center items-center {boxClasses}">
            <svg
                data-label="icon"
                class="flex-shrink-0 {classes}"
                width={width || selected.width || '100%'}
                height={height || selected.height || '100%'}
                viewBox="0 0 {selected.width} {selected.height}"
                xmlns="http://www.w3.org/2000/svg">
                {#each selected.path as path}
                    <path
                        class:stroke={path.strokeWidth}
                        class:fixedstrokeColor={path.strokeColor}
                        class:fill-current={!path.strokeWidth && !path.strokeColor}
                        class:stroke-current={path.strokeWidth && !path.strokeColor}
                        d={path.d}
                        fill-rule={path.fillRule || ''}
                        clip-rule={path.clipRule || ''}
                        stroke-width={path.strokeWidth || ''}
                        stroke-linecap={path.strokeLinecap || ''}
                        stroke={path.strokeColor || ''}
                        opacity={path.opacity || 1}
                        fill={path.fill || ''} />
                {/each}
            </svg>
        </div>
    {:else}
        <svg
            data-label="icon"
            class="flex-shrink-0 {classes}"
            width={width || selected.width || '100%'}
            height={height || selected.height || '100%'}
            viewBox="0 0 {selected.width} {selected.height}"
            xmlns="http://www.w3.org/2000/svg">
            {#each selected.path as path}
                <path
                    class:stroke={path.strokeWidth}
                    class:fixedstrokeColor={path.strokeColor}
                    class:fill-current={!path.strokeWidth && !path.strokeColor}
                    class:stroke-current={path.strokeWidth && !path.strokeColor}
                    d={path.d}
                    fill-rule={path.fillRule || ''}
                    clip-rule={path.clipRule || ''}
                    stroke-width={path.strokeWidth || ''}
                    stroke-linecap={path.strokeLinecap || ''}
                    stroke={path.strokeColor || ''}
                    opacity={path.opacity || 1}
                    fill={path.fill || ''} />
            {/each}
        </svg>
    {/if}
{/if}
