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

                <slot name="header" />
            </v-container>
        </v-app-bar>
   
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
