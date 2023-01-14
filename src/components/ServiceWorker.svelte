<script type="ts">
  import { declareGlobal } from "../utils/window";
  import { pushNotification } from "./Notifications.svelte";

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", async () => {
      if ((location.pathname || "/") === "/") {

        // Register sw:
        const sw = await navigator.serviceWorker.register("sw.js");
        sw.addEventListener("updatefound", () => {
          pushNotification({ message: "An update has been found! Downloading update...", type: "standard", title: "Update Found" });
          console.log("SW update found!");
          const newWorker = sw.installing;
          newWorker?.addEventListener("statechange", () => {
            console.log(newWorker.state);
            if (newWorker.state === "activated") {
              const dismiss = pushNotification({ message: "An update has been downloaded, would you like to reload the page to enable it?<div style='margin-top:1rem;border:1px dashed currentColor;border-radius:0.5rem;padding:0.5rem;'><a href='javascript:location.reload()' onClick='event.stopPropagation()' style='margin-right:0.5rem;text-decoration-color:currentColor;'><i class='icofont-check'></i> yes</a> <a href='javascript:window._temp?.dismissNotification()' onClick='event.stopPropagation()' style='text-decoration-color:currentColor;'><i class='icofont-close'></i> no</a></div>", type: "success", title: "Update Available", hideDismissButton: true });
              declareGlobal("dismissNotification", dismiss);
            }
          });
        });
      }
    });
  }
</script>