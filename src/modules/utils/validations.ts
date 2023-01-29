import { UserService } from '../../shared/services/user';

export class ValidatorUser {
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  constructor(private userService: UserService) {}

  public async Signup(user: any, fields: string[]): Promise<{ error: boolean; errors: any }> {
    // eslint-disable-next-line prefer-const
    let errors: { error: boolean; errors: any } = { error: false, errors: [] };

    //validar que los campos no esten vacíos
    fields.forEach(field => {
      if (typeof user[field] == 'undefined' || user[field] === '' || user[field].length === 0) {
        errors.error = true;
        errors.errors.push({ message: `Este campo no puede estar vacío`, type: `INPUT_${field.toUpperCase()}` });
      }
    });

    if (errors.error) return errors;

    //validar que los nombres sean válidos
    if (user['name']) {
      const expRegexName = /^[a-zA-Z\u00C0-\u024F\u1E00-\u1EFF\s]*$/;
      if (!expRegexName.test(user['name'])) {
        errors.error = true;
        errors.errors.push({ message: 'El nombre ingresado no es válido.', type: 'INPUT_NAME' });
      }
    }

    if (errors.error) return errors;

    //Verificar que las contraseñas sean iguales y que sean lo suficientemente fuertes
    if (user['password_1'] && user['password_2']) {
      if (user['password_1'] !== user['password_2']) {
        errors.error = true;
        errors.errors.push({ message: 'Las contraseñas son distintas', type: 'INPUT_PASSWORD_1' });
        errors.errors.push({ message: 'Las contraseñas son distintas', type: 'INPUT_PASSWORD_2' });
        return errors;
      }

      const expRegexPassword = new RegExp(
        '^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})'
      );
      if (!expRegexPassword.test(user['password_1'])) {
        errors.error = true;
        errors.errors.push({ message: 'Por favor ingresa una contraseña más segura', type: 'INPUT_PASSWORD_1' });
        return errors;
      }
    }

    //validar que el correo sea válido y que no exista en la base de datos
    if (user['email']) {
      const expRegex =
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
      //validar que el correo sea valido
      if (!expRegex.test(user['email'])) {
        errors.error = true;
        errors.errors.push({ message: 'El correo ingresado no es válido.', type: 'INPUT_EMAIL' });
        return errors;
      }

      const userStore = await this.userService.findUserByEmail(user['email'], 'id');
      if (userStore) {
        errors.error = true;
        errors.errors.push({ message: 'Ya existe una cuenta con el correo ingresado', type: 'INPUT_EMAIL' });
        return errors;
      }
    }

    return errors;
  }

  public Signin(user: any, fields: string[]): { error: boolean; errors: any } {
    // eslint-disable-next-line prefer-const
    let errors: { error: boolean; errors: any } = { error: false, errors: [] };

    //validar que los campos no esten vacíos
    fields.forEach(field => {
      if (typeof user[field] == 'undefined' || user[field] === '' || user[field].length === 0) {
        errors.error = true;
        errors.errors.push({ message: `Este campo no puede estar vacío`, type: `INPUT_${field.toUpperCase()}` });
      }
    });

    if (errors.error) return errors;

    if (user['email']) {
      const expRegex =
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
      //validar que el correo sea valido
      if (!expRegex.test(user['email'])) {
        errors.error = true;
        errors.errors.push({ message: 'El correo ingresado no es válido.', type: 'INPUT_EMAIL' });
        return errors;
      }
    }

    return errors;
  }
}
