/*!
 *
 */

const assert = require("chai").assert;

const base64 = require("../../lib/util/base64");

const testdata = [
  {
    description: "boundary repeat",
    data: new Uint8Array([165, 165, 165, 165, 165, 165, 165, 165, 165, 165, 165, 165]),
    b64: "paWlpaWlpaWlpaWl",
    b64u: "paWlpaWlpaWlpaWl"
  },
  {
    description: "2-pad repeat",
    data: new Uint8Array([90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90]),
    b64: "WlpaWlpaWlpaWlpaWlpaWg==",
    b64u: "WlpaWlpaWlpaWlpaWlpaWg"
  },
  {
    description: "1-pad repeat",
    data: new Uint8Array([90, 165, 90, 165, 90, 165, 90, 165, 90, 165, 90, 165, 90, 165, 90, 165, 90, 165, 90, 165, 90, 165, 90]),
    b64: "WqVapVqlWqVapVqlWqVapVqlWqVapVo=",
    b64u: "WqVapVqlWqVapVqlWqVapVqlWqVapVo"
  },
  {
    description: "large data",
    data: new Uint8Array([255, 254, 253, 252, 251, 250, 249, 248, 247, 246, 245, 244, 243, 242, 241, 240, 239, 238, 237, 236, 235, 234, 233, 232, 231, 230, 229, 228, 227, 226, 225, 224, 223, 222, 221, 220, 219, 218, 217, 216, 215, 214, 213, 212, 211, 210, 209, 208, 207, 206, 205, 204, 203, 202, 201, 200, 199, 198, 197, 196, 195, 194, 193, 192, 191, 190, 189, 188, 187, 186, 185, 184, 183, 182, 181, 180, 179, 178, 177, 176, 175, 174, 173, 172, 171, 170, 169, 168, 167, 166, 165, 164, 163, 162, 161, 160, 159, 158, 157, 156, 155, 154, 153, 152, 151, 150, 149, 148, 147, 146, 145, 144, 143, 142, 141, 140, 139, 138, 137, 136, 135, 134, 133, 132, 131, 130, 129, 128, 127, 126, 125, 124, 123, 122, 121, 120, 119, 118, 117, 116, 115, 114, 113, 112, 111, 110, 109, 108, 107, 106, 105, 104, 103, 102, 101, 100, 99, 98, 97, 96, 95, 94, 93, 92, 91, 90, 89, 88, 87, 86, 85, 84, 83, 82, 81, 80, 79, 78, 77, 76, 75, 74, 73, 72, 71, 70, 69, 68, 67, 66, 65, 64, 63, 62, 61, 60, 59, 58, 57, 56, 55, 54, 53, 52, 51, 50, 49, 48, 47, 46, 45, 44, 43, 42, 41, 40, 39, 38, 37, 36, 35, 34, 33, 32, 31, 30, 29, 28, 27, 26, 25, 24, 23, 22, 21, 20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0]),
    b64: "//79/Pv6+fj39vX08/Lx8O/u7ezr6uno5+bl5OPi4eDf3t3c29rZ2NfW1dTT0tHQz87NzMvKycjHxsXEw8LBwL++vby7urm4t7a1tLOysbCvrq2sq6qpqKempaSjoqGgn56dnJuamZiXlpWUk5KRkI+OjYyLiomIh4aFhIOCgYB/fn18e3p5eHd2dXRzcnFwb25tbGtqaWhnZmVkY2JhYF9eXVxbWllYV1ZVVFNSUVBPTk1MS0pJSEdGRURDQkFAPz49PDs6OTg3NjU0MzIxMC8uLSwrKikoJyYlJCMiISAfHh0cGxoZGBcWFRQTEhEQDw4NDAsKCQgHBgUEAwIBAA==",
    b64u: "__79_Pv6-fj39vX08_Lx8O_u7ezr6uno5-bl5OPi4eDf3t3c29rZ2NfW1dTT0tHQz87NzMvKycjHxsXEw8LBwL--vby7urm4t7a1tLOysbCvrq2sq6qpqKempaSjoqGgn56dnJuamZiXlpWUk5KRkI-OjYyLiomIh4aFhIOCgYB_fn18e3p5eHd2dXRzcnFwb25tbGtqaWhnZmVkY2JhYF9eXVxbWllYV1ZVVFNSUVBPTk1MS0pJSEdGRURDQkFAPz49PDs6OTg3NjU0MzIxMC8uLSwrKikoJyYlJCMiISAfHh0cGxoZGBcWFRQTEhEQDw4NDAsKCQgHBgUEAwIBAA"
  },
  {
    description: "boundary random",
    data: new Uint8Array([15, 181, 251, 156, 91, 247, 208, 19, 21, 165, 6, 178, 98, 182, 68, 116, 227, 38, 247, 124, 117, 241, 72, 80]),
    b64: "D7X7nFv30BMVpQayYrZEdOMm93x18UhQ",
    b64u: "D7X7nFv30BMVpQayYrZEdOMm93x18UhQ"
  },
  {
    description: "even-size random",
    data: new Uint8Array([105, 109, 247, 63, 130, 193, 254, 89, 181, 147, 94, 101, 248, 151, 143, 10, 119, 32, 185, 238, 153, 202, 93, 15, 186, 45, 220, 107, 47, 192, 51, 14]),
    b64: "aW33P4LB/lm1k15l+JePCncgue6Zyl0Pui3cay/AMw4=",
    b64u: "aW33P4LB_lm1k15l-JePCncgue6Zyl0Pui3cay_AMw4"
  },
  {
    description: "odd-size random",
    data: new Uint8Array([52, 14, 66, 16, 41, 200, 26, 145, 70, 169, 220, 150, 8, 43, 255, 202, 59, 151, 128, 130, 206, 204, 204, 40, 56, 55, 53, 179, 152, 201, 152, 237, 30, 7, 144, 239, 214, 72, 188, 194, 173, 183, 222, 17, 107, 136, 187]),
    b64: "NA5CECnIGpFGqdyWCCv/yjuXgILOzMwoODc1s5jJmO0eB5Dv1ki8wq233hFriLs=",
    b64u: "NA5CECnIGpFGqdyWCCv_yjuXgILOzMwoODc1s5jJmO0eB5Dv1ki8wq233hFriLs"
  },
  {
    description: "three bytes",
    data: new Uint8Array([1, 2, 3]),
    b64: "AQID",
    b64u: "AQID"
  },
  {
    description: "2 bytes",
    data: new Uint8Array([3, 2]),
    b64: "AwI=",
    b64u: "AwI"
  },
  {
    description: "single byte",
    data: new Uint8Array([3]),
    b64: "Aw==",
    b64u: "Aw"
  },
  {
    description: "empty",
    data: new Uint8Array([]),
    b64: "",
    b64u: ""
  }
];

describe("util/base64", () => {
  for (let tc of testdata) {
    let { description, data, b64, b64u } = tc;
    it (`encodes BufferSource => base64: ${description}`, () => {
      let actual = base64.encode(data);
      assert.strictEqual(actual, b64);
    });
    it(`encodes BufferSource => base64url: ${description}`, () => {
      let actual = base64.urlEncode(data);
      assert.strictEqual(actual, b64u);
    });
    it(`decodes base64 => BufferSource: ${description}`, () => {
      let actual = base64.decode(b64);
      assert.deepEqual(actual, data);
    });
    it(`decodes base64url => BufferSource: ${description}`, () => {
      let actual = base64.decode(b64u);
      assert.deepEqual(actual, data);
    });
  }
});
