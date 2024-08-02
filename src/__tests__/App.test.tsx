import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import App from '../renderer/App';
import { ResProvider } from '../context';

describe('App', () => {
  it('should render', () => {
    expect(
      render(
        <ResProvider>
          <App />
        </ResProvider>,
      ),
    ).toBeTruthy();
  });
});
