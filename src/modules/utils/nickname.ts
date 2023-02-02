import { UserService } from '../../shared/services/user';

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
