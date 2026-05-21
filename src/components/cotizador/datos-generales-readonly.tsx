import { Section, Grid, Field, TextInput, DateInput, Select } from "@/components/cotizador/shared";
import { useAseguradoras } from "@/lib/store";

export function DatosGeneralesReadonly() {
  const [aseguradoras] = useAseguradoras();
  const noop = () => {};
  return (
    <Section title="Datos generales">
      <Grid>
        <Field label="Nombre completo del contratante*">
          <TextInput value="" onChange={noop} placeholder="Nombre aquí" />
        </Field>
        <Field label="Número de contacto*">
          <TextInput value="" onChange={noop} placeholder="+00 0000 0000 00" />
        </Field>
        <Field label="Tipo de asegurado*">
          <Select value="" onChange={noop} options={["Individual", "Familiar", "Otro asegurado"]} placeholder="Selecciona" />
        </Field>
        <Field label="Correo de contacto*">
          <TextInput type="email" value="" onChange={noop} placeholder="correo@ejemplo.com" />
        </Field>
        <Field label="Sexo*">
          <Select value="" onChange={noop} options={["Masculino", "Femenino"]} placeholder="Selecciona" />
        </Field>
        <Field label="Código postal*">
          <TextInput value="" onChange={noop} placeholder="Lore ipsum dolor est" />
        </Field>
        <Field label="Fecha de nacimiento*">
          <DateInput value="" onChange={noop} />
        </Field>
        <Field label="Fecha de antiguedad">
          <DateInput value="" onChange={noop} />
        </Field>
        <Field label="Tipo de seguro*">
          <Select value="" onChange={noop} options={["Auto", "Gastos Médicos Mayores", "Vida", "Exceso"]} placeholder="Selecciona" />
        </Field>
        <Field label="Aseguradora*">
          <Select
            value=""
            onChange={noop}
            options={aseguradoras.map((a) => a.name)}
            placeholder={aseguradoras.length === 0 ? "Registra aseguradoras primero" : "Selecciona"}
          />
        </Field>
        <Field label="Tipo de plan*">
          <Select value="" onChange={noop} options={[]} placeholder="Selecciona aseguradora y tipo de seguro" disabled />
        </Field>
        <Field label="Tipo de persona*">
          <Select value="" onChange={noop} options={["Persona Física", "Persona Moral"]} placeholder="Selecciona" />
        </Field>
      </Grid>
    </Section>
  );
}