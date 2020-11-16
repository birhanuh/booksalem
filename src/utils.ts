import { verify, sign } from 'jsonwebtoken'
import { Context } from './context'

interface Token {
  userId: string
}

export function getUserId(context: Context) {
  const Authorization = context.request.get('Authorization')
  if (Authorization) {
    const token = Authorization.replace('Bearer ', '')
    const verifiedToken = verify(token, process.env.JWT_SECRET as string) as Token
    return verifiedToken && verifiedToken.userId
  }

  throw new AuthError()
}

export class AuthError extends Error {
  constructor() {
    super('Could not authenticate users.')
  }
}

export const createToken = (userId: number) => sign({ userId, expiresIn: '7d' }, process.env.JWT_SECRET as string);

/**
import Sequelize from "sequelize";
import _ from "lodash";

export const formatErrors = e => {
  if (e instanceof Sequelize.ValidationError) {
    // _.pick({a: 1, b:2}, 'a') => {a: 1}
    return e.errors.map(x => _.pick(x, ["path", "message"]));
  }
  return [{ path: "name", message: "something went wrong" }];
};

interface Error {
  path: string;
  message: string;
}

export const normalizeErrors = (errors: Error[]) => {
  const errMap: { [key: string]: string } = {};

  errors.forEach(err => {
    errMap[err.path] = err.message;
  });

  return errMap;
};

export const formatErrors = (e: any) => {
  return e.map((x: any) => [{ path: x.path[0], message: x.message }]);
};

*/