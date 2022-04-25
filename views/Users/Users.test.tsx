import { screen } from '@testing-library/react';
import { customRender } from 'test-client/test-utils';
import UsersView from 'views/Users';
import { fakeUsers } from 'test-client/server/fake-data';

describe('Users View', () => {
  // almost same like HomeView
  test('renders pagination section and users cards list', async () => {
    customRender(<UsersView />);

    // assert title
    const title = await screen.findByRole('heading', {
      name: /users/i,
    });
    expect(title).toBeInTheDocument();

    // assert pagination button 1
    const paginationButton = screen.getByRole('button', {
      name: /1/i,
    });
    expect(paginationButton).toBeInTheDocument();

    // assert search input
    const searchInput = screen.getByRole('textbox', {
      name: /search/i,
    });
    expect(searchInput).toBeInTheDocument();

    // assert first users's username link
    const usernameLink = screen.getAllByRole('link', {
      name: RegExp(`@${fakeUsers.items[0].username}`, 'i'),
    })[0];
    expect(usernameLink).toBeInTheDocument();
  });

  // test search filters users - same as in HomeView
});
