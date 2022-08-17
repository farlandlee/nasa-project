const request = require('supertest');
const app = require('../../app');
const { 
    mongoConnect,
    mongoDisconnect,
} = require('../../services/mongo');


describe("Test Launches API", () => {
    beforeAll(async () => {
        await mongoConnect();
    });

    afterAll(async () => {
        await mongoDisconnect();
    });
    
    describe("Test GET /launches", () => {
        test("it should return 200 and be json", async () => {
            const response = await request(app)
                .get('/v1/launches')
                .expect('Content-Type', /json/)
                .expect(200);
        })
    });

    describe("Test POST /launches", () => {
        const completeLaunchData = {
            mission: "Strange New Worlds",
            rocket: "NCC 1701-D Enterprise",
            target: "Kepler-62 f",
            launchDate: "December 21, 2026"
        };

        const launchDataWithoutDate = {
            mission: "Strange New Worlds",
            rocket: "NCC 1701-D Enterprise",
            target: "Kepler-62 f"
        };

        const launchDataWithBadDate = {
            mission: "Strange New Worlds",
            rocket: "NCC 1701-D Enterprise",
            target: "Kepler-62 f",
            launchDate: "December 21, 2026a"
        };

        test("It should return 201 created", async () => {
            const response = await request(app)
                .post('/v1/launches')
                .send(completeLaunchData)
                .expect('Content-Type', /json/)
                .expect(201);

            const requestDate = new Date(completeLaunchData.launchDate).valueOf();
            const responseDate = new Date(response.body.launchDate).valueOf();

            expect(responseDate).toBe(requestDate);
            // https://jestjs.io/docs/expect#tomatchobjectobject
            expect(response.body).toMatchObject(launchDataWithoutDate);
        })

        test("It should catch missing parameters", async() => {
            const response = await request(app)
                .post('/v1/launches')
                .send(launchDataWithoutDate)
                .expect('Content-Type', /json/)
                .expect(400);
            // https://jestjs.io/docs/expect#tostrictequalvalue
            expect(response.body).toStrictEqual({
                error: "Missing required parameter"
            });
        })

        test("It should catch invalid dates", async () => {
            const response = await request(app)
                .post('/v1/launches')
                .send(launchDataWithBadDate)
                .expect('Content-Type', /json/)
                .expect(400);

            expect(response.body).toStrictEqual({
                error: 'Invalid launch date',
            });
        })
    });
});

