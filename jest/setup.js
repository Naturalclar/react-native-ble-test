jest.mock(
  "NativeEventEmitter",
  () =>
    class MockNativeEventEmitter {
      addListener = () => jest.fn();

      removeListener = () => jest.fn();

      removeAllListeners = () => jest.fn();
    }
);