<template>
  <div class="modal_wrap">
    <div class="modal">
      <div class="title" v-html="title">
      </div>
      <div class="content" v-html="content">
      </div>
    </div>
    <div class="modal_back"></div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"

const p = defineProps<{
  link: string,
}>()

const title = ref("")
const content = ref("")

if (p.link === "privacy") {
  title.value = "Privacy Policy"
  content.value = `
  These Terms of Use set forth the terms of use for the services provided by YourCat (the "Services"). All users (hereinafter referred to as "Users"), regardless of whether they use the posting function or not, are required to use the Service in accordance with these Terms of Use. <h3>Article 1 (Application)</h3> These Terms of Use shall apply to all relationships between Users and the use of the Service. <h3>Article 2 (Prohibited Matters)</h3> Users shall not engage in any of the following acts when using the Service. <ul><li>Actions that violate laws or public order and morals, or criminal acts</li><li>Acts that infringe on intellectual property rights, such as copyrights and trademarks.</li><li>Actions that destroy or interfere with the functions of this service or any other third party's server or network.</li><li>An act that interferes with the Operator's service operation</li><li>Attempting to gain unauthorized access</li><li>Acts of collecting or accumulating personal information about other users.</li><li>Actions that cause disadvantage, damage, or discomfort to other users of this service or other third parties.</li><li>An act of impersonating another user.</li><li>An act that directly or indirectly provides benefits to antisocial forces in relation to the Operator's service.</li><li>Any other act that the Operator deems inappropriate.</li></ul><h3>Article 3 (Change or suspension of the provision of the Service)</h3> This service may change the contents of the provided service without prior notice to the user. In addition, all or part of the provided services may be stopped or suspended without prior notice. <h3>Article 4 (Disclaimer)</h3> The operator of this service shall not be liable for any damages incurred by users due to this service.<h3>Article 5 (Changes to the Terms of Use)</h3> The operator of this service may change the Terms of Use at any time without notice to the user, if it deems it necessary. In the event that a User begins using the Service after a change to the Terms, the User shall be deemed to have agreed to the changed Terms. <h3>Article 6 (Governing Law and Jurisdiction)</h3> These Terms shall be governed by and construed in accordance with the laws of Japan. In the event of a dispute regarding this service, the court with jurisdiction over the location of the operator shall have exclusive jurisdiction. <p style="margin: 3em 0.3em 0px 0px; font-size: 1em; color: rgb(141, 141, 141); text-align: right;">Revision: 2022/2/2</p>
  `
} else if (p.link === "terms") {
  title.value = "Terms of Use"
  content.value = `
  <h3>About the collection of personal information</h3> This site can be used without registration at this time (however, this may change in the future as we improve our services and require registration for convenience and to prevent harassment). <h3>About the information you post</h3> The information you enter on this site is used only to perform the functions of the service and is not stored on any external server. The APIs used to display maps and areas are used in accordance with <a href="https://policies.google.com/">Google</a>'s and <a href="https://traveltime.com/privacy-policy/">TravleTime</a>'s terms of service and privacy policy respectively. <h3>About access analysis tools</h3> This website uses Google Analytics for access analysis. Google Analytics uses cookies to collect data, but does not identify individuals. You can opt out of tracking by Google Analytics by disabling cookies. For more information, please see the <a href="https://policies.google.com/">Google Analytics Policy and Terms of Use</a>. <p style="margin: 3em 0.3em 0px 0px; font-size: 1em; color: rgb(141, 141, 141); text-align: right;">Revision: 2022/2/2</p>
  `
}
</script>

<style lang="scss" scoped>
.modal_wrap {
  .modal {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    margin: auto;
    padding: 1.3em 3em;
    max-width: 500px;
    max-height: 600px;
    color: #4e4e4e;
    background-color: #f4ebe3;
    border-radius: 9px;
    box-shadow: 2px 2px 4px 0px rgba(0,0,0, 0.19);
    z-index: 14;
    overflow-y: scroll;
    .title {
      margin-bottom: 1.1em;
      font-size: 1.5em;
      font-weight: bold;
      text-align: center;
    }
  }
  .modal_back {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    margin: auto;
    background-color: #242423;
    opacity: 0.666;
    z-index: 12;
  }
}
</style>
