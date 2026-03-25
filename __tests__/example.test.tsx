import { render, screen } from '@testing-library/react-native';
import { Text } from '@/components/Text';

describe('Example', () => {
  it('renders text correctly', () => {
    render(<Text>Hello Bingket</Text>);
    expect(screen.getByText('Hello Bingket')).toBeTruthy();
  });
});
