import auth from '@/auth.js';

export default (await import('vue')).defineComponent({
name: 'App',
computed: {
isLoggedIn() {
return auth.user;
},
},
methods: {
logout() {
auth.logout();
this.$router.push('/');
}
}
});
