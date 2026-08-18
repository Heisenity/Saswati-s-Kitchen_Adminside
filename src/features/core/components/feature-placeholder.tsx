type FeaturePlaceholderProps = {
  description: string;
  eyebrow: string;
  title: string;
};

export function FeaturePlaceholder({ description, eyebrow, title }: FeaturePlaceholderProps) {
  return (
    <section className="max-w-2xl pt-2">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{eyebrow}</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{title}</h1>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{description}</p>
      <div className="mt-8 rounded-lg border border-dashed bg-card px-5 py-12 text-center">
        <p className="text-sm font-medium text-foreground">This workspace is ready for its first workflow.</p>
        <p className="mt-1 text-sm text-muted-foreground">Product capabilities will be added here in a later phase.</p>
      </div>
    </section>
  );
}
