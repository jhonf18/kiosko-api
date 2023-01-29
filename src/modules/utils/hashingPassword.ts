import { compare, genSaltSync, hashSync } from 'bcrypt-nodejs';

export class HashingPassword {
  public async comparePassword(password: string, newPassword: string): Promise<boolean> {
    return new Promise((resolve, _reject) => {
      compare(newPassword, password, (err, result) => {
        if (err) resolve(false);
        resolve(result);
      });
    });
  }

  public async encryptPassword(password: string): Promise<string> {
    const salt = genSaltSync(10);
    const newPassword = hashSync(password, salt);
    return newPassword;
  }
}
