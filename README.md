# Bus Server
###查询公交名带31的：/line?name=31
                [
                  {
                    "info": "火车站->机场",
                    "line": "313",
                    "lineId": "814a683c-7512-47e2-ab99-a7e523b7f45b"
                  },
                  {
                    "info": "机场->火车站",
                    "line": "313",
                    "lineId": "076f4db7-dc99-45c8-9ca5-1a5540b002ad"
                  }
                ]

###查询公交实时状态：/realTime?id=076f4db7-dc99-45c8-9ca5-1a5540b002ad
                [
                  {"name": "机场"},
                  {"name": "公交站1"},
                  {
                    "name": "公交站2",
                    "bus": "车牌号",
                    "time": "21:36:32"
                  },
                  {"name": "火车站"}
                ]
