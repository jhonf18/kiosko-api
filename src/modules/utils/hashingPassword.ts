import { compare, genSalt, hash } from 'bcrypt-nodejs';

export class HashingPassword {
  public async comparePassword(password: string, newPassword: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      compare(newPassword, password, (err, result) => {
        if (err) {
          reject(new Error(err.message));
        }

        resolve(result);
      });
    });
  }

  public async encryptPassword(password: string): Promise<string> {
    return new Promise((resolve, reject) => {
      genSalt(10, (err, salt) => {
        if (err) reject(new Error(err.message));

        hash(password, salt, null, (err, hash) => {
          if (err) reject(new Error(err.message));

          resolve(hash);
        });
      });
    });
  }
}
