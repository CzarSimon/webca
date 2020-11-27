import reducer from './reducer';
import { addInvitation } from './actions';
import { InvitationState, Invitation } from '../../types';

test('invitation reducer: add invitation', () => {
  const initalState: InvitationState = {
    invitation: undefined,
    loaded: false,
  };

  const inivte: Invitation = {
    id: '10fd3fe1-9efe-4cc3-93d8-aea04bbb287a',
    email: 'new.user@webca.io',
    role: 'ADMIN',
    status: 'CREATED',
    createdById: 'f5a2c2df-a293-4899-994a-ccec242e932f',
    account: {
      id: '56da2101-ff20-4728-b517-b48eba84a654',
      name: 'test-account',
      createdAt: '2020-10-12T23:05:32Z',
      updatedAt: '2020-10-13T23:05:32Z',
    },
    createdAt: '2020-10-15T23:05:32Z',
    validTo: '2020-11-15T23:05:32Z',
  };

  const state = reducer(initalState, addInvitation(inivte));
  expect(state.loaded).toBe(true);
  expect(state.invitation).toBe(inivte);
});
