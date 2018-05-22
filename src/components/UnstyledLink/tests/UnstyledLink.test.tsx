import * as React from 'react';
import UnstyledLink from '../UnstyledLink';
import {
  shallowWithAppProvider,
  mountWithAppProvider,
} from '../../../../tests/utilities';

import Link from '../../AppProvider/Link';

describe('<UnstyledLink />', () => {
  describe('custom link component', () => {
    it('uses a custom link component instead of an anchor', () => {
      const CustomLinkComponent = () => <div />;
      const link = new Link(CustomLinkComponent);
      const mockContext = {context: {polaris: {link}}};
      const anchorElement = mountWithAppProvider(
        <UnstyledLink external url="https://redhio.com" />,
        mockContext,
      ).find(CustomLinkComponent);

      expect(anchorElement.length).toBe(1);
    });
  });

  describe('external', () => {
    it('adds the correct attributes', () => {
      const anchorElement = shallowWithAppProvider(
        <UnstyledLink external url="https://redhio.com" />,
      ).find('a');
      expect(anchorElement.prop('target')).toBe('_blank');
      expect(anchorElement.prop('rel')).toBe('noopener noreferrer');
    });
  });
});
