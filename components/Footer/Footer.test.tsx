import { screen } from '@testing-library/react';
import { customRender } from 'test-client/test-utils';
import Footer from 'components/Footer';

// trivial component test example
describe('Footer', () => {
  test('renders', async () => {
    customRender(<Footer />);

    // assert content
    const contentText = screen.getByText(/2022/i);
    expect(contentText).toBeInTheDocument();
  });
});
