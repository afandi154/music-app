import {
  Form as VeeForm,
  Field as VeeField,
  defineRule,
  ErrorMessage,
  configure
} from 'vee-validate'
import {
  required,
  min,
  max,
  alpha_spaces as alphaSpaces,
  email,
  min_value as minVal,
  max_value as maxVal,
  confirmed,
  not_one_of as excluded
} from '@vee-validate/rules'

export default {
  install(app) {
    app.component('VeeForm', VeeForm)
    app.component('VeeField', VeeField)
    app.component('ErrorMessage', ErrorMessage)

    defineRule('required', required)
    defineRule('tos', required)
    defineRule('min', min)
    defineRule('max', max)
    defineRule('alpha_spaces', alphaSpaces)
    defineRule('email', email)
    defineRule('min_value', minVal)
    defineRule('max_value', maxVal)
    defineRule('password_mismatch', confirmed)
    defineRule('excluded', excluded)

    configure({
      generateMessage: (context) => {
        const messages = {
          required: `The field ${context.field} is required`,
          tos: `You must accept the Term of Service`,
          min: `The field ${context.field} is to short`,
          max: `The field ${context.field} is to long`,
          alpha_spaces: `The field ${context.field} may only contain alphabetical characters and spaces`,
          email: `The field ${context.field} must be a valid email`,
          min_value: `The field ${context.field} is to low`,
          max_value: `The field ${context.field} is to high`,
          password_mismatch: `The password don't match`,
          excluded: `You are not allowed to use this value on the ${context.field}`
        }

        const message = messages[context.rule.name]
          ? messages[context.rule.name]
          : `The field ${context.field} is invalid.`

        return message
      },
      validateOnBlur: false,
      validateOnChange: true,
      validateOnInput: true,
      validateOnModelUpdate: true
    })
  }
}
