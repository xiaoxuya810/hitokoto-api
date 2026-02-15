api代码：
<?php
//面向对象连接数据库
class Db
{
    private $host;
    private $user;
    private $pass;
    private $dbname;
    private $charset;
    private $link;
    public function __construct($host, $user, $pass, $dbname, $charset)
    {
        $this->host = $host;
        $this->user = $user;
        $this->pass = $pass;
        $this->dbname = $dbname;
        $this->charset = $charset;
        $this->connect();
    }
    private function connect()
    {
        $this->link = mysqli_connect($this->host, $this->user, $this->pass, $this->dbname);
        mysqli_set_charset($this->link, $this->charset);
    }
    public function query($sql)
    {
        $res = mysqli_query($this->link, $sql);
        return $res;
    }
    public function close()
    {
        mysqli_close($this->link);
    }
}
//随机查询data_love 10条数据
$db = new Db('sh-cdb-1loef8ei.sql.tencentcdb.com:59298', 'open_api', 'open_api', 'api', 'utf8mb4');
$sql = "SELECT * FROM Data_love ORDER BY RAND() LIMIT 10";
$res = $db->query($sql);
$data = mysqli_fetch_all($res, MYSQLI_ASSOC);
$db->close();
//输出格式化的json
$data = [
    'code' => 200,
    'data' => $data,
    'by' => '小旭'
];
//设置header json
header('Content-Type: application/json');
echo json_encode($data, JSON_UNESCAPED_UNICODE|JSON_PRETTY_PRINT);
?>

获取一言句子包：

三種方法引入我們提供的語句包：
1. JSDelivr: https://cdn.jsdelivr.net/gh/hitokoto-osc/sentences-bundle@latest/
2. Github Raw: https://raw.githubusercontent.com/hitokoto-osc/sentences-bundle/master/
3. Pages: https://sentences-bundle.hitokoto.cn/
定时存入数据库