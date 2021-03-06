#pragma once 

#include <node.h>
#include <nan.h>
#include <v8.h>
#include <node_buffer.h>
#include <functional>
#include <iostream>
#include <sstream>
#include <array>
#include <map>

#include <framework/marshal/marshal.hpp>
#include <framework/Logger.h>


class ArgumentMismatchException
{
public:

    ArgumentMismatchException(const std::string& msg);
    ArgumentMismatchException(int actual, int expected);
    ArgumentMismatchException(int actual, const std::initializer_list<int>& expected);

    virtual const char * what() const
    {
        return mMessage.c_str();
    }

    virtual ~ArgumentMismatchException()
    {
    }

private:
    std::string mMessage;
};

typedef std::function<bool(Nan::NAN_METHOD_ARGS_TYPE) > InitFunction;

class NanMethodArgBinding;
class NanCheckArguments;

template <typename EnumType>
class NanArgStringEnum;

//////////////////////////////////////////////////////////////////////////

class NanCheckArguments
{
public:
    NanCheckArguments(Nan::NAN_METHOD_ARGS_TYPE info);

    NanCheckArguments& ArgumentsCount(int count);
    NanCheckArguments& ArgumentsCount(int argsCount1, int argsCount2);

    NanMethodArgBinding Argument(int index);

    /**
     * Unwind all fluent calls
     */
    operator bool() const;

    NanCheckArguments& AddAndClause(InitFunction rightCondition);
    NanCheckArguments& Error(std::string * error);

private:
    Nan::NAN_METHOD_ARGS_TYPE m_info;
    InitFunction          m_init;
    std::string         * m_error;
};

//////////////////////////////////////////////////////////////////////////

template <typename EnumType>
class NanArgStringEnum
{
public:
    explicit NanArgStringEnum(
        std::initializer_list< std::pair<const char*, EnumType> > possibleValues, 
        NanMethodArgBinding& owner,
        int argIndex);

    NanCheckArguments& Bind(EnumType& value);
protected:

    bool TryMatchStringEnum(const std::string& key, EnumType& outValue) const;

private:
    std::map<std::string, EnumType>     mPossibleValues;
    NanMethodArgBinding&                mOwner;
    int                                 mArgIndex;
};

//////////////////////////////////////////////////////////////////////////

/**
 * @brief This class wraps particular positional argument 
 */
class NanMethodArgBinding
{
public:

    template <typename EnumType>
    friend class NanArgStringEnum;

    NanMethodArgBinding(int index, NanCheckArguments& parent);

    NanMethodArgBinding& IsBuffer();
    NanMethodArgBinding& IsFunction();
    NanMethodArgBinding& IsString();
    NanMethodArgBinding& NotNull();
    NanMethodArgBinding& IsArray();

    template <typename T>
    NanArgStringEnum<T> StringEnum(std::initializer_list< std::pair<const char*, T> > possibleValues);

    template <typename T>
    NanCheckArguments& Bind(v8::Local<T>& value);

    template <typename T>
    NanCheckArguments& Bind(T& value);

    template <typename T1, typename T2>
    NanCheckArguments& BindAny(T1& value1, T2& value2);
    
private:
    int                 mArgIndex;
    NanCheckArguments&  mParent;
};

//////////////////////////////////////////////////////////////////////////

NanCheckArguments NanCheck(Nan::NAN_METHOD_ARGS_TYPE info);

//////////////////////////////////////////////////////////////////////////
// Template functions implementation

template <typename T>
NanCheckArguments& NanMethodArgBinding::Bind(v8::Local<T>& value)
{
    return mParent.AddAndClause([this, &value](Nan::NAN_METHOD_ARGS_TYPE info) {
        value = info[mArgIndex].As<T>();
        return true;
    });
}


template <typename T>
NanCheckArguments& NanMethodArgBinding::Bind(T& value)
{
    return mParent.AddAndClause([this, &value](Nan::NAN_METHOD_ARGS_TYPE info) {
        return MarshalToNative(info[mArgIndex], value);
    });
}

template <typename T1, typename T2>
NanCheckArguments& NanMethodArgBinding::BindAny(T1& value1, T2& value2)
{
    return mParent.AddAndClause([this, &value1, &value2](Nan::NAN_METHOD_ARGS_TYPE info) {
        return MarshalToNative(info[mArgIndex], value1) || MarshalToNative(info[mArgIndex], value2);
    });  
}

template <typename T>
NanArgStringEnum<T> NanMethodArgBinding::StringEnum(std::initializer_list< std::pair<const char*, T> > possibleValues)
{
    return std::move(NanArgStringEnum<T>(possibleValues, IsString(), mArgIndex));
}

//////////////////////////////////////////////////////////////////////////

template <typename T>
NanArgStringEnum<T>::NanArgStringEnum(
    std::initializer_list< std::pair<const char*, T> > possibleValues, 
    NanMethodArgBinding& owner, int argIndex)
: mPossibleValues(possibleValues.begin(), possibleValues.end())
, mOwner(owner)
, mArgIndex(argIndex)
{
}

template <typename T>
NanCheckArguments& NanArgStringEnum<T>::Bind(T& value)
{
    return mOwner.mParent.AddAndClause([this, &value](Nan::NAN_METHOD_ARGS_TYPE info) {
        std::string key;
        return MarshalToNative(info[mArgIndex], key) && TryMatchStringEnum(key.c_str(), value);
    });
}

template <typename T>
bool NanArgStringEnum<T>::TryMatchStringEnum(const std::string& key, T& outValue) const
{
    auto it = mPossibleValues.find(key);
    if (it != mPossibleValues.end())
    {
        outValue = it->second;
        return true;
    }

    LOG_TRACE_MESSAGE("Cannot map string value " << key << " to any known enum values");
    return false;
}