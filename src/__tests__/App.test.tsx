import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { HashRouter } from 'react-router-dom'; // Ensure Router context
import App from '../renderer/App';
import { ResProvider } from '../context';

describe('App', () => {
  it('should render without crashing', () => {
    render(
      <HashRouter>
        <ResProvider>
          <App />
        </ResProvider>
      </HashRouter>,
    );
  });
});
