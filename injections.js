window.__USE_UNSTATED_TOOLS__ = true;

window.__UNSTATED_TOOLS_INIT = function () {
  window.postMessage({ source: "unstated-devtools", type: "init" }, "*");
};

const originalCreateContainer = window.createContainer;
if (originalCreateContainer) {
  window.createContainer = function (hookFn) {
    const container = originalCreateContainer(hookFn);

    const origUseContainer = container.useContainer;
    container.useContainer = function () {
      const instance = origUseContainer();
      window.postMessage(
        {
          source: "unstated-devtools",
          type: "container-init",
          name: container.Provider.displayName || hookFn.name,
          state: { ...instance },
        },
        "*",
      );

      // Subscribe to updates by proxying each state setter
      Object.entries(instance)
        .filter(([_, v]) => typeof v === "function")
        .forEach(([key, fn]) => {
          const propName = key;
          instance[key] = function (...args) {
            const result = fn(...args);
            window.postMessage(
              {
                source: "unstated-devtools",
                type: "state-change",
                container: hookFn.name,
                prop: propName,
                args,
                state: { ...instance },
              },
              "*",
            );
            return result;
          };
        });

      return instance;
    };

    return container;
  };
}
