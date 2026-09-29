import { cn } from "@/lib/utils"

/**
 * An LTR island for technical identifiers inside Arabic text — part numbers,
 * markings, hardware numbers, order numbers. `<bdi>` isolates the run so
 * "0281 018 758" never reorders around the Arabic next to it.
 *
 * `mono` switches to Plex Mono for an identifier shown on its own
 * (spec rows, order numbers), where fixed-width groups are easier to verify.
 */
function Ltr({
  className,
  mono = false,
  ...props
}: React.ComponentProps<"bdi"> & { mono?: boolean }) {
  return (
    <bdi
      dir="ltr"
      data-slot="ltr"
      // w-fit: as a flex/grid item the island is blockified and would stretch,
      // and a stretched LTR box aligns its text to the *left* of an RTL row.
      className={cn("w-fit", mono && "font-mono tracking-tight", className)}
      {...props}
    />
  )
}

export { Ltr }
