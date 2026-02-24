<script lang="ts">
  interface Props {
    label: string;
    id: string;
    options: Array<{ value: string; label: string }>;
    value?: string;
    placeholder?: string;
    disabled?: boolean;
    error?: string;
  }

  let {
    label,
    id,
    options,
    value = $bindable(''),
    placeholder,
    disabled = false,
    error,
  }: Props = $props();
</script>

<div>
  <label for={id} class="block text-sm font-medium text-text-primary mb-1">
    {label}
  </label>
  <select
    {id}
    bind:value
    {disabled}
    class="block w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-accent focus:ring-1 focus:ring-accent disabled:cursor-not-allowed disabled:bg-surface-alt"
  >
    {#if placeholder}
      <option value="" disabled>{placeholder}</option>
    {/if}
    {#each options as opt}
      <option value={opt.value}>{opt.label}</option>
    {/each}
  </select>
  {#if error}
    <p class="mt-1 text-xs text-error">{error}</p>
  {/if}
</div>
