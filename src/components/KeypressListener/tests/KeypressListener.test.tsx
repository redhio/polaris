import * as React from 'react';
import {mount} from 'enzyme';
import {noop} from '@redhio/javascript-utilities/other';

import KeypressListener from '../KeypressListener';
import {Keys} from '../../../types';

interface HandlerMap {
  [eventName: string]: (event: any) => void;
}

const originalAddEventListener = document.addEventListener;
const originalRemoveEventListener = document.removeEventListener;
const listenerMap: HandlerMap = {};

describe('<KeypressListener />', () => {
  beforeEach(() => {
    document.addEventListener = jest.fn((event, cb) => {
      listenerMap[event] = cb;
    });

    document.removeEventListener = jest.fn((event) => {
      listenerMap[event] = noop;
    });
  });

  afterEach(() => {
    document.addEventListener = originalAddEventListener;
    document.removeEventListener = originalRemoveEventListener;
  });

  it('attaches a listener for the given key on mount', () => {
    const spy = jest.fn();

    mount(<KeypressListener handler={spy} keyCode={Keys.ESCAPE} />);

    listenerMap.keyup({keyCode: Keys.ESCAPE});
    listenerMap.keyup({keyCode: Keys.ENTER});
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('removes listener for the given key on unmount', () => {
    const spy = jest.fn();

    mount(<KeypressListener handler={spy} keyCode={Keys.ESCAPE} />).unmount();

    listenerMap.keyup({keyCode: Keys.ESCAPE});
    expect(spy).not.toBeCalled();
  });
});
