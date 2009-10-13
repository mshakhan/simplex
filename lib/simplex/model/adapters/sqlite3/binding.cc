#include <node.h>
#include <sqlite3.h>

using namespace v8;
using namespace node;

class Sqlite3 : ObjectWrap {
 public:
  sqlite3* db;
  int errCode; 
  
  static void Initialize (v8::Handle<v8::Object> target) {
    HandleScope scope;
    Local<FunctionTemplate> ft = FunctionTemplate::New(New);

    ft->InstanceTemplate()->SetInternalFieldCount(1);

    NODE_SET_PROTOTYPE_METHOD(ft, "close", Close);
    NODE_SET_PROTOTYPE_METHOD(ft, "exec", Exec);

    target->Set(String::NewSymbol("Sqlite3"), ft->GetFunction());
  }
      
  static Handle<Value> New(const Arguments& args) {
    HandleScope scope;

    Sqlite3 *sqlite = new Sqlite3();
    if (args.Length() == 0 || !args[0]->IsString()) {
      return ThrowException(
        Exception::Error(
          String::New("First argument should be a database file name")));
    }

    String::Utf8Value conninfo(args[0]->ToString());

    bool res = sqlite->Connect(*conninfo);

    if (!res) {
      return ThrowException(
        Exception::Error(
          String::New(sqlite->ErrorMessage())));
    }   

    sqlite->Wrap(args.This());

    return args.This();
  }
  
  bool Connect (const char* conninfo) {
    if(db) { return false; }
    errCode = sqlite3_open(conninfo, &db);
    if(errCode != SQLITE_OK) {
      sqlite3_close(db);
      return false;
    }   
    Attach();
    return true;
  }
  
  Handle<Value> Exec(char* query) {
    char* errMsg = NULL;
    char **rawResult;
    int rowCount;
    int colCount;  
    
    errCode = sqlite3_get_table(db, query, &rawResult, &rowCount, &colCount, &errMsg);
    Local<Array> result = Array::New();
    if(errCode == SQLITE_OK ){
      char* value;
      for(int row = 1; row <= rowCount; ++row) {
        Local<Object> rowObject = Object::New();
        for(int col = 0; col < colCount; ++col) {
          value = rawResult[colCount * row + col];
          rowObject->Set(
            String::New(rawResult[col]), 
            value ? String::New(value) : Null());
        }
        result->Set(Integer::New(row - 1), rowObject);
      }      
    } else {
      sqlite3_free_table(rawResult);
      return ThrowException(
        Exception::Error(
          String::New(ErrorMessage())));
    }
        
    sqlite3_free_table(rawResult);
    return result;
  }
  
  void Close() {
    if(db) { sqlite3_close(db); }
    Detach();
  }
  
  const char* ErrorMessage() {
    return sqlite3_errmsg(db);
  }  
    
  protected:
  static Handle<Value> Close(const Arguments& args) {
    HandleScope scope;
    Sqlite3 *sqlite = ObjectWrap::Unwrap<Sqlite3>(args.This());
    sqlite->Close();
    
    return Undefined();
  }

  static Handle<Value> Exec(const Arguments& args) {
    HandleScope scope;

    if (args.Length() == 0 || !args[0]->IsString()) {
      return ThrowException(
        Exception::Error(
          String::New("Firt argument should be a query string")));
    }

    Sqlite3 *sqlite = ObjectWrap::Unwrap<Sqlite3>(args.This());
    String::Utf8Value query(args[0]->ToString());    

    return sqlite->Exec(*query);
  }
  
  Sqlite3 () {
    db = NULL;
    errCode = SQLITE_OK;
  }  
};

extern "C" void init (Handle<Object> target) {
  HandleScope scope;
  Sqlite3::Initialize(target);
}
