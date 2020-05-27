import reducer from './reducer';
import { addUser, removeUser } from './actions';
import { UserState, User } from '../../types';

test('user reducer: add user', () => {
  const initalState: UserState = {
    user: undefined,
    loaded: false,
  };

  const user: User = {
    id: '7bda829e-ccd6-4c84-b5ae-c70f8445043b',
    email: 'user@webca.io',
    role: 'USER',
    createdAt: 'some-date',
    updatedAt: 'some-date',
    account: {
      id: '39c278a5-8b6c-463f-a1fd-32dfcc8f4dbc',
      name: 'test-account',
      createdAt: 'some-date',
      updatedAt: 'some-date',
    },
  };

  const state = reducer(initalState, addUser(user));
  expect(state.loaded).toBe(true);
  expect(state.user).toBe(user);
});

test('user reducer: remove user', () => {
  const user: User = {
    id: '7bda829e-ccd6-4c84-b5ae-c70f8445043b',
    email: 'user@webca.io',
    role: 'USER',
    createdAt: 'some-date',
    updatedAt: 'some-date',
    account: {
      id: '39c278a5-8b6c-463f-a1fd-32dfcc8f4dbc',
      name: 'test-account',
      createdAt: 'some-date',
      updatedAt: 'some-date',
    },
  };

  const initalState: UserState = {
    loaded: true,
    user,
  };

  const state = reducer(initalState, removeUser());
  expect(state.loaded).toBe(false);
  expect(state.user).toBeUndefined();
});
