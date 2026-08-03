/* An accessible single-choice group.
   Native radio inputs are used (visually hidden) so arrow-key
   navigation, screen-reader semantics and form validation all come
   for free — no custom keyboard handling to get wrong. */

export default function OptionGroup({
  name,
  legend,
  options,
  value,
  onChange,
  error,
  columns = 2,
}) {
  const errorId = error ? `${name}-error` : undefined;

  return (
    <fieldset
      className="optgroup"
      aria-describedby={errorId}
      aria-invalid={error ? "true" : undefined}
    >
      <legend className="optgroup__legend">{legend}</legend>

      <div className={`optgroup__grid optgroup__grid--${columns}`}>
        {options.map((opt) => {
          const id = `${name}-${opt.id}`;
          const checked = value === opt.id;
          return (
            <label
              key={opt.id}
              className={`option ${checked ? "is-selected" : ""}`}
              htmlFor={id}
              data-spot=""
              data-cursor="hover"
            >
              <input
                type="radio"
                id={id}
                name={name}
                value={opt.id}
                checked={checked}
                onChange={() => onChange(opt.id)}
                className="option__input"
              />
              <span className="option__mark" aria-hidden="true" />
              <span className="option__label">{opt.label}</span>
            </label>
          );
        })}
      </div>

      {error && (
        <p className="field__error" id={errorId} role="alert">
          {error}
        </p>
      )}
    </fieldset>
  );
}
