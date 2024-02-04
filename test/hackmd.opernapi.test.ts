import * as hackMdAPI from '../hackmd-api/generated/api/apis';


describe('UserApi test suite', () => {
    
    
    test('check user details', async () => {
        let userApi = new hackMdAPI.UserApi()
        userApi.accessToken = "<access token>"
        let userData = await userApi.getUserData()

        console.log(userData)
    });
    
});

