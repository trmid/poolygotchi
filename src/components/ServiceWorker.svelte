<script type="ts">
  import { declareGlobal } from "../utils/window";
  import InstallSplash from "./InstallSplash.svelte";
  import { pushNotification } from "./Notifications.svelte";

  let serviceWorkerNotAvailable = false;
  let installState: "installing" | "installed" | "activating" | "activated" | "parsed" | "redundant" | "ready" = "installing";

  // Try to check for service worker before page load so the spinner doesn't show up
  try {
   if("serviceWorker" in navigator && navigator.serviceWorker.controller) installState = "ready";
  } catch(err) {
    // nothing
  }

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", async () => {
      if ((location.pathname || "/") === "/") {

        // Register sw:
        const serviceWorkerExists = !!navigator.serviceWorker.controller;
        if(serviceWorkerExists) installState = "ready";
        const sw = await navigator.serviceWorker.register("sw.js");
        sw.addEventListener("updatefound", () => {
          if(serviceWorkerExists) pushNotification({ message: "An update has been found! Downloading update <i class='icofont-custom-spinner'></i>", type: "standard", title: "Update Found" });
          console.log("SW update found!");
          const newWorker = sw.installing;
          newWorker?.addEventListener("statechange", () => {
            console.log(newWorker.state);
            if(installState !== "ready") installState = newWorker.state;
            if (newWorker.state === "activated") {
              if(serviceWorkerExists) {
                const dismiss = pushNotification({
                  message: `An update has been downloaded, would you like to reload the page to enable it?` +
                  `<div style='margin-top:1rem;border-radius:0.5rem;padding:0.5rem;background-color:var(--c3);color:#444;white-space:normal; '>
                    <a href='javascript:location.reload()' onClick='event.stopPropagation()' style='margin-right:0.5rem;text-decoration-color:currentColor;'>
                      <i class='icofont-check'></i> yes
                    </a>
                    <a href='javascript:window._temp?.dismissNotification()' onClick='event.stopPropagation()' style='text-decoration-color:currentColor;'>
                      <i class='icofont-close'></i> no
                    </a>
                  </div>`,
                  type: "success",
                  title: "Update Available",
                  hideDismissButton: true,
                  persist: true
                });
                declareGlobal("dismissNotification", dismiss);
              } else {
                location.reload();
              }
            }
          });
        });
      } else {
        serviceWorkerNotAvailable = true;
      }
    });
  } else {
    serviceWorkerNotAvailable = true;
  }
</script>

{#if installState !== "ready" && !serviceWorkerNotAvailable}
  <InstallSplash {installState}/>
{/if}