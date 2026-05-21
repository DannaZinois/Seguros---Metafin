import { Section, Grid, Field, TextInput, DateInput, Select } from "@/components/cotizador/shared";
import { useAseguradoras } from "@/lib/store";
import type { ClienteProfile } from "@/lib/clientes-data";

export function DatosGeneralesReadonly({
  profile,
  tipoSeguro,
  aseguradora,
}: {
  profile?: ClienteProfile;
  tipoSeguro?: string;
  aseguradora?: string;
}) {
  const [aseguradoras] = useAseguradoras();
  const noop = () => {};
  const v = (s: string | undefined) => s ?? "";
  return (
    <Section title="Datos generales">
      <Grid>
        <Field label="Nombre completo del contratante*">
          <TextInput value={v(profile?.nombre)} onChange={noop} placeholder="Nombre aquí" />
        </Field>
        <Field label="Número de contacto*">
          <TextInput value={v(profile?.contacto)} onChange={noop} placeholder="+00 0000 0000 00" />
        </Field>
        <Field label="Tipo de asegurado">
          <Select value={v(profile?.tipoAsegurado)} onChange={noop} options={["Individual", "Familiar", "Colectivo", "Otro asegurado"]} placeholder="Nombre aquí" />
        </Field>
        <Field label="RFC*">
          <TextInput value={v(profile?.rfc)} onChange={noop} placeholder="Lore ipsum dolor est" />
        </Field>
        <Field label="Sexo">
          <Select value={v(profile?.sexo)} onChange={noop} options={["Masculino", "Femenino", "N/A"]} placeholder="Nombre aquí" />
        </Field>
        <Field label="Dirección*">
          <TextInput value={v(profile?.direccion)} onChange={noop} placeholder="Lore ipsum dolor est" />
        </Field>
        <Field label="Código postal*">
          <TextInput value={v(profile?.codigoPostal)} onChange={noop} placeholder="Lore ipsum dolor est" />
        </Field>
        <Field label="Fecha de nacimiento*">
          <DateInput value={v(profile?.fechaNacimiento)} onChange={noop} />
        </Field>
        <Field label="Fecha de antiguedad">
          <DateInput value={v(profile?.fechaAntiguedad)} onChange={noop} />
        </Field>
        <Field label="Tipo de seguro*">
          <Select value={v(tipoSeguro)} onChange={noop} options={["Auto", "GMM", "Gastos Médicos Mayores", "Vida", "Exceso"]} placeholder="Nombre aquí" />
        </Field>
        <Field label="Aseguradora*">
          <Select
            value={v(aseguradora)}
            onChange={noop}
            options={Array.from(new Set([...(aseguradora ? [aseguradora] : []), ...aseguradoras.map((a) => a.name)]))}
            placeholder={aseguradoras.length === 0 ? "Registra aseguradoras primero" : "Nombre aquí"}
          />
        </Field>
        <Field label="Tipo de persona*">
          <Select value={v(profile?.tipoPersona)} onChange={noop} options={["Persona Física", "Persona Moral"]} placeholder="Nombre aquí" />
        </Field>
      </Grid>
    </Section>
  );
}