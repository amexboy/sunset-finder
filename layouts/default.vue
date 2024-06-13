<template>
    <v-app id="inspire">
        <v-app-bar flat>
            <v-container class="mx-auto d-flex align-center justify-center">

                <v-avatar class="me-4 " color="grey-darken-1" size="32"></v-avatar>
                <span>Sun Set Finder</span>

                <slot name="actions">
                    <v-btn v-for="link in links" :key="link" :text="link" variant="text"></v-btn>
                </slot>

                <v-spacer></v-spacer>

                <v-responsive max-width="160">
                    <slot name="header" />
                </v-responsive>
            </v-container>
        </v-app-bar>
        <v-navigation-drawer class="pt-4" color="grey-lighten-3" permanent model-value :rail="rail">
            <v-btn :icon="'mdi-chevron-' + (rail ? 'right' : 'left')" variant="text" @click.stop="rail = !rail">
            </v-btn>
            <!-- <v-avatar v-for="n in 6" :key="n" :color="`grey-${n === 1 ? 'darken' : 'lighten'}-1`"
                :size="n === 1 ? 36 : 20" class="d-block text-center mx-auto mb-9"></v-avatar> -->
            <v-divider />
            <v-list density="compact" nav>
                <v-list-item prepend-icon="mdi-pin" title="Home"
                    to="/?a={lat:52.5209554,lng:13.4094429}&b={lat:52.5209554,lng:13.4094429}"></v-list-item>
            </v-list>
            <slot name="side-bar" />

        </v-navigation-drawer>

        <v-main class="bg-grey-lighten-3">

            <slot />
        </v-main>
    </v-app>
</template>

<script setup>

const rail = ref(true)

const links = [
    // 'Dashboard',
    // 'Messages',
    // 'Profile',
    // 'Updates',
]
</script>
