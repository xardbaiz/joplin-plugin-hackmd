import * as hackMdAPI from '../hackmd-api/generated/api/apis';


describe('UserApi test suite', () => {
    
    
    test('check user details', async () => {
        let userApi = new hackMdAPI.UserApi()
        userApi.accessToken = "36O9WEBA5JBCHL9BQHM0K8DO6KRURC3VXRRG05TE0MCOC8ZOI1"
        let userData = await userApi.getUserData()

        console.log(userData)
    });
    
});

