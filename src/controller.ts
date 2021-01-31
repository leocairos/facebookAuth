import { Request, Response } from 'express';
import * as queryString from 'query-string';

import axios from 'axios';
import { IInfoUser } from './model';

const {
  BASE_URL,
  FACEBOOK_CLIENT_ID,
  FACEBOOK_CLIENT_SECRET,
  FACEBOOK_URL_REDIRECT,
  FACEBOOK_STATE_ST,
  FACEBOOK_STATE_DS } = process.env;

let auth = false;
let code: string = '';
let token: string = '';
let userId: string = '';

async function getAccessTokenFromCode(code: string) {
  const { data } = await axios({
    url: 'https://graph.facebook.com/v9.0/oauth/access_token',
    method: 'get',
    params: {
      client_id: FACEBOOK_CLIENT_ID,
      client_secret: FACEBOOK_CLIENT_SECRET,
      redirect_uri: FACEBOOK_URL_REDIRECT,
      code,
    },
  });
  //console.log(data); // { access_token, token_type, expires_in }
  return data.access_token;
};

async function getFacebookUserData(access_token: string) {
  const { data } = await axios({
    url: 'https://graph.facebook.com/me',
    method: 'get',
    params: {
      fields: ['id', 'email', 'first_name', 'last_name', 'picture'].join(','),
      access_token,
    },
  });
  //console.log(data); // { id, email, first_name, last_name }
  userId = data.id;
  return data;
};

const stringifiedParams = queryString.stringify({
  client_id: FACEBOOK_CLIENT_ID,
  redirect_uri: FACEBOOK_URL_REDIRECT,
  scope: ['email', 'public_profile'].join(','),
  //state: `{st=${FACEBOOK_STATE_ST},ds=${FACEBOOK_STATE_DS}}`,
  response_type: 'code',
  //auth_type: 'rerequest',
  //display: 'popup',
});

const facebookLoginUrl = `https://www.facebook.com/v9.0/dialog/oauth?${stringifiedParams}`;

async function getIndex(req: Request, res: Response, next: any) {
  if (auth) {
    const getUserInfo = await getFacebookUserData(token);
    let userInfo: IInfoUser = {
      id: getUserInfo.id,
      email: getUserInfo.email,
      name: getUserInfo.first_name + ' ' + getUserInfo.last_name,
      picture: getUserInfo.picture?.data?.url
    }
    console.log('userInfo:', userInfo);
    res.render('index', { user: userInfo, url: `${BASE_URL}/logout` });
  } else {
    res.render('index', { user: {}, url: facebookLoginUrl });
  }
}

async function facebookCallback(req: Request, res: Response, next: any) {
  code = req.query.code as string || '';
  if (code !== '') {
    token = await getAccessTokenFromCode(code) || '';
    if (token !== '') auth = true
  }
  res.redirect('/');
}

async function facebookLogout(req: Request, res: Response, next: any) {

  const { data } = await axios({
    url: `https://graph.facebook.com/${userId}/permissions`,
    method: 'delete',
    params: {
      access_token: token,
    },
  });
  console.log(data); // { id, email, first_name, last_name }  

  auth = false;
  code = '';
  token = '';
  res.redirect('/');
}

export default { getIndex, facebookCallback, facebookLogout }