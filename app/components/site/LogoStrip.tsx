const logos = [
  'CMC CORP',
  'FPT',
  'ORACLE',
  'SAP',
  'magicblocks',
  'odoo',
  'CORSAIR',
  'elgato',
  'THANHNHAN TELECOM',
  'SHINYAMA',
  'R&B',
  'SAPCO',
  'magicblocks',
  'Teazentea',
];
export default function LogoStrip() {
  return (
    <section className="border-y bg-secondary/30">
      <div className="container py-10">
        <p className="text-center text-sm uppercase tracking-widest text-muted-foreground mb-6">
          Trusted by teams worldwide
        </p>
        <div className="grid grid-cols-2 gap-6 text-center md:grid-cols-4 lg:grid-cols-7">
          {logos.map((l) => (
            <div key={l} className="text-sm text-foreground/70">
              {l}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
