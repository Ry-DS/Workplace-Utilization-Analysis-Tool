import React from 'react';
import PropTypes from 'prop-types';
import {FormFeedback, Input, InputGroup, InputGroupAddon, InputGroupText} from "reactstrap";

FormField.propTypes = {
  error: PropTypes.string,//error,if there is any
  onChange: PropTypes.func.isRequired,
  value: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired

};

function FormField({error, name, value, onChange, placeholder, children, className, ...rest}) {
  const finalError = typeof error === 'string' ? error : error?.msg;
  return (
    <InputGroup className='mb-3'>
      <InputGroupAddon addonType="prepend">
        <InputGroupText>
          {children}
        </InputGroupText>
      </InputGroupAddon>
      <Input onChange={onChange}
             value={value}
             id={name} type="text" className={(finalError ? 'is-invalid' : '') + ' ' + className}
             placeholder={name} autoComplete="email" {...rest} />
      <FormFeedback>{finalError}</FormFeedback>

    </InputGroup>

  );
}
//use this to automatically handle error state and pass it on, instead of you managing it yourself.
const makeWithErrorState = Component => ({errors, setErrors, field, onChange, ...rest}) => {
  return <Component error={errors[field]} onChange={e => {
    onChange(e.target.value);
    delete errors[field];
    setErrors(errors);

  }} {...rest}/>
};
export const FormFieldWithError = makeWithErrorState(FormField);
FormFieldWithError.propTypes = {
  onChange: PropTypes.func.isRequired,
  value: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  errors: PropTypes.object.isRequired,
  setErrors: PropTypes.func.isRequired,
  field: PropTypes.string.isRequired
}


export default FormField;
