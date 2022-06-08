const memory = require('../../src/model/data/memory/index');

describe('Memory', () => {
  test('writeFragment() returns nothing', async () => {
    const fragment = { ownerId: 'a', id: 'b' };
    const result = await memory.writeFragment(fragment);
    expect(result).toBe(undefined);
  });

  test('readFragment() returns what we writeFragment() into the db', async () => {
    const fragment = {
      ownerId: 'a',
      id: 'b',
      created: '2021-11-02T15:09:50.403Z',
      updated: '2021-11-02T15:09:50.403Z',
      type: 'text/plain',
      size: 256,
    };
    await memory.writeFragment(fragment);
    const result = await memory.readFragment('a', 'b');
    expect(result).toEqual(fragment);
  });

  test('writeFragmentData() and readFragmentData() work with Buffers', async () => {
    const data = Buffer.from([1, 2, 3]);
    await memory.writeFragmentData('a', 'b', data);
    const result = await memory.readFragmentData('a', 'b');
    expect(result).toEqual(data);
  });

  test('listFragments() returns all the expanded fragment objects with given primary key', async () => {
    const fragment1 = { ownerId: 'x', id: 'a', size: 1 };
    await memory.writeFragment(fragment1);
    const fragment2 = { ownerId: 'x', id: 'b', size: 2 };
    await memory.writeFragment(fragment2);
    const fragment3 = { ownerId: 'x', id: 'c', size: 3 };
    await memory.writeFragment(fragment3);

    const results = await memory.listFragments('x', true);
    //Checking if listFragments() returns an array
    expect(Array.isArray(results)).toBe(true);
    //Checking if listFragments() returns exact same number of elements with the given key
    expect(results.length).toEqual(3);
    //Checking if listFragments() returns exact same value for those elements with the given key
    expect(results).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ size: 1 }),
        expect.objectContaining({ size: 2 }),
        expect.objectContaining({ size: 3 }),
      ])
    );
  });

  test('listFragments() returns fragment id with given primary key', async () => {
    const fragment1 = { ownerId: 'y', id: 'a', size: 1 };
    await memory.writeFragment(fragment1);
    const fragment2 = { ownerId: 'y', id: 'b', size: 2 };
    await memory.writeFragment(fragment2);

    const results = await memory.listFragments('y');
    //Checking if listFragments() returns an array
    expect(Array.isArray(results)).toBe(true);
    //Checking if listFragments() returns exact same number of elements with the given key
    expect(results.length).toEqual(2);
    //Checking if listFragments() returns exact id/secondary key for those elements with the given key
    expect(results).toEqual(expect.arrayContaining(['a', 'b']));
  });

  test('deleteFragment() removes value writeFragment() into db', async () => {
    //Fragment's metadata
    const fragment = { ownerId: 'z', id: 'a', size: 1 };
    await memory.writeFragment(fragment);
    const resultMetadata = await memory.readFragment('z', 'a');
    expect(resultMetadata).toEqual(fragment);

    //Fragment's data
    const data = Buffer.from([1, 2, 3]);
    await memory.writeFragmentData('z', 'a', data);
    const resultData = await memory.readFragmentData('a', 'b');
    expect(resultData).toEqual(data);

    //Delete fragment's metadata and data from memory db.
    await memory.deleteFragment('z', 'a');
    expect(await memory.readFragment('z', 'a')).toBe(undefined);
  });

  test('deleteFragment() throws if primaryKey and secondaryKey not in db', () => {
    expect(() => memory.deleteFragment('z', 'a')).rejects.toThrow();
  });
});
