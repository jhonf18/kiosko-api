import { UserService } from '../../shared/services/user';

/**
 * It takes a nickname, a user service, and an idUser, and returns a nickname that is not already in
 * use
 * @param {string} nickname - The nickname that the user wants to use.
 * @param {UserService} userService - UserService - this is the service that will be used to check if
 * the nickname is already in use.
 * @param {string} idUser - The user's ID.
 * @returns A string
 */
export const generateNickName = async (nickname: string, userService: UserService, idUser: string): Promise<string> => {
  const term = nickname.split(' ');
  const expRegular = term.join('\\b)(?=.*\\b');
  const nicknamesUsed = await userService.findUserByRegex(expRegular);

  if (nicknamesUsed.includes(nickname)) {
    let count = 0;
    while (nicknamesUsed.includes(nickname) && count < 6) {
      const suffix = Math.floor(Math.random() * 100) + 1;
      nickname = `${nickname}${suffix}`;
      count++;
    }
    if (count === 6) {
      return `${nickname}${idUser}`;
    } else {
      return nickname;
    }
  } else {
    return nickname;
  }
};
